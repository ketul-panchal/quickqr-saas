import Restaurant from '../models/restaurant.model.js';
import Category from '../models/category.model.js';
import MenuItem from '../models/menuItem.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Get public menu by restaurant slug
 * @route   GET /api/v1/menu/:slug
 * @access  Public
 */
export const getPublicMenu = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Find restaurant
  const restaurant = await Restaurant.findOne({
    slug,
    isActive: true,
  }).select('-owner -stats.totalRevenue');

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  // Check if published (optional - you may want to allow preview)
  // if (!restaurant.isPublished) {
  //   throw ApiError.notFound('Restaurant menu is not available');
  // }

  // Get categories with items
  const categories = await Category.find({
    restaurant: restaurant._id,
    isActive: true,
  }).sort({ order: 1 });

  // Get all active items
  const items = await MenuItem.find({
    restaurant: restaurant._id,
    isActive: true,
  }).sort({ order: 1 });

  // Group items by category
  const categoriesWithItems = categories.map((category) => ({
    ...category.toObject(),
    items: items.filter(
      (item) => item.category.toString() === category._id.toString()
    ),
  }));

  // Increment scan count
  await Restaurant.findByIdAndUpdate(restaurant._id, {
    $inc: { 'stats.totalScans': 1 },
  });

  ApiResponse.success({
    restaurant: {
      _id: restaurant._id,
      name: restaurant.name,
      slug: restaurant.slug,
      subtitle: restaurant.subtitle,
      description: restaurant.description,
      phone: restaurant.phone,
      timing: restaurant.timing,
      address: restaurant.address,
      logo: restaurant.logo,
      coverImage: restaurant.coverImage,
      template: restaurant.template,
      theme: restaurant.theme,
      socialLinks: restaurant.socialLinks,
      features: restaurant.features,
    },
    categories: categoriesWithItems,
  }).send(res);
});

/**
 * @desc    Get single menu item details (public)
 * @route   GET /api/v1/menu/:slug/item/:itemId
 * @access  Public
 */
export const getPublicMenuItem = asyncHandler(async (req, res) => {
  const { slug, itemId } = req.params;

  // Find restaurant
  const restaurant = await Restaurant.findOne({
    slug,
    isActive: true,
  });

  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  // Find item
  const item = await MenuItem.findOne({
    _id: itemId,
    restaurant: restaurant._id,
    isActive: true,
  }).populate('category', 'name');

  if (!item) {
    throw ApiError.notFound('Item not found');
  }

  ApiResponse.success({ item }).send(res);
});