import Restaurant from '../models/restaurant.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { paginate } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * @desc    Create new restaurant
 * @route   POST /api/v1/restaurants
 * @access  Private
 */
export const createRestaurant = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check user's subscription limits
  const user = await User.findById(userId);
  const restaurantCount = await Restaurant.countDocuments({ owner: userId });

  if (restaurantCount >= user.subscription.features.maxRestaurants) {
    throw ApiError.forbidden(
      `You have reached the maximum number of restaurants (${user.subscription.features.maxRestaurants}) for your plan. Please upgrade to add more.`
    );
  }

  // Check if slug is already taken
  const slugExists = await Restaurant.isSlugTaken(req.body.slug);
  if (slugExists) {
    throw ApiError.conflict('This slug is already taken. Please choose a different one.');
  }

  // Create restaurant
  const restaurant = await Restaurant.create({
    ...req.body,
    owner: userId,
  });

  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalRestaurants': 1 },
  });

  logger.info(`Restaurant created: ${restaurant.name} by user ${userId}`);

  ApiResponse.created(restaurant, 'Restaurant created successfully').send(res);
});

/**
 * @desc    Get all restaurants for current user
 * @route   GET /api/v1/restaurants
 * @access  Private
 */
export const getMyRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;
  const userId = req.user.id;

  // Build query
  const query = { owner: userId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Get total count
  const total = await Restaurant.countDocuments(query);
  const pagination = paginate(page, limit, total);

  // Get restaurants
  const restaurants = await Restaurant.find(query)
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.itemsPerPage);

  ApiResponse.success({
    restaurants,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
    },
  }).send(res);
});

/**
 * @desc    Get single restaurant
 * @route   GET /api/v1/restaurants/:id
 * @access  Private
 */
export const getRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: id, owner: userId });

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  ApiResponse.success(restaurant).send(res);
});

/**
 * @desc    Get restaurant by slug (public)
 * @route   GET /api/v1/restaurants/slug/:slug
 * @access  Public
 */
export const getRestaurantBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const restaurant = await Restaurant.findOne({ 
    slug, 
    isActive: true, 
    isPublished: true 
  }).select('-owner -stats.totalRevenue');

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  // Increment scan count
  await Restaurant.findByIdAndUpdate(restaurant._id, {
    $inc: { 'stats.totalScans': 1 },
  });

  ApiResponse.success(restaurant).send(res);
});

/**
 * @desc    Update restaurant
 * @route   PUT /api/v1/restaurants/:id
 * @access  Private
 */
export const updateRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  let restaurant = await Restaurant.findOne({ _id: id, owner: userId });

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  // Check if slug is being changed and if new slug is taken
  if (req.body.slug && req.body.slug !== restaurant.slug) {
    const slugExists = await Restaurant.isSlugTaken(req.body.slug, id);
    if (slugExists) {
      throw ApiError.conflict('This slug is already taken. Please choose a different one.');
    }
  }

  // Update restaurant
  restaurant = await Restaurant.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  logger.info(`Restaurant updated: ${restaurant.name}`);

  ApiResponse.success(restaurant, 'Restaurant updated successfully').send(res);
});

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/v1/restaurants/:id
 * @access  Private
 */
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: id, owner: userId });

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  await Restaurant.findByIdAndDelete(id);

  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalRestaurants': -1 },
  });

  // TODO: Delete related data (menus, categories, items, orders, etc.)

  logger.info(`Restaurant deleted: ${restaurant.name}`);

  ApiResponse.success(null, 'Restaurant deleted successfully').send(res);
});

/**
 * @desc    Check if slug is available
 * @route   GET /api/v1/restaurants/check-slug
 * @access  Private
 */
export const checkSlugAvailability = asyncHandler(async (req, res) => {
  const { slug, excludeId } = req.query;

  const isAvailable = !(await Restaurant.isSlugTaken(slug, excludeId));

  ApiResponse.success({ isAvailable }).send(res);
});

/**
 * @desc    Upload restaurant logo
 * @route   POST /api/v1/restaurants/:id/logo
 * @access  Private
 */
export const uploadLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: id, owner: userId });

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  // Build full URL for the uploaded file
  const protocol = req.protocol;
  const host = req.get('host');
  const logoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  restaurant.logo = {
    url: logoUrl,
    publicId: req.file.filename,
  };

  await restaurant.save();

  ApiResponse.success(restaurant, 'Logo uploaded successfully').send(res);
});

/**
 * @desc    Upload restaurant cover image
 * @route   POST /api/v1/restaurants/:id/cover
 * @access  Private
 */
export const uploadCoverImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: id, owner: userId });

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  // Build full URL for the uploaded file
  const protocol = req.protocol;
  const host = req.get('host');
  const coverUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  restaurant.coverImage = {
    url: coverUrl,
    publicId: req.file.filename,
  };

  await restaurant.save();

  ApiResponse.success(restaurant, 'Cover image uploaded successfully').send(res);
});

/**
 * @desc    Toggle restaurant publish status
 * @route   PATCH /api/v1/restaurants/:id/publish
 * @access  Private
 */
export const togglePublish = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: id, owner: userId });

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  restaurant.isPublished = !restaurant.isPublished;
  await restaurant.save();

  ApiResponse.success(
    restaurant,
    `Restaurant ${restaurant.isPublished ? 'published' : 'unpublished'} successfully`
  ).send(res);
});