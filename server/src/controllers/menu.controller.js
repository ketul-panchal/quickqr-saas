import Category from '../models/category.model.js';
import MenuItem from '../models/menuItem.model.js';
import Restaurant from '../models/restaurant.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../config/logger.js';

/**
 * Helper function to verify restaurant access
 * Allows both restaurant owners and admin users
 */
const verifyRestaurantAccess = async (restaurantId, user) => {
  // Admin users can access any restaurant
  if (user.role === 'admin' || user.role === 'super_admin') {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw ApiError.notFound('Restaurant not found');
    }
    return restaurant;
  }
  
  // Regular users must be the owner
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: user.id });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }
  return restaurant;
};

// ============ CATEGORIES ============

/**
 * @desc    Get all categories for a restaurant
 * @route   GET /api/v1/restaurants/:restaurantId/categories
 * @access  Private
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  const categories = await Category.find({ restaurant: restaurantId })
    .sort({ order: 1, createdAt: 1 });

  // Get item count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const itemCount = await MenuItem.countDocuments({ category: category._id });
      return {
        ...category.toObject(),
        itemCount,
      };
    })
  );

  ApiResponse.success({ categories: categoriesWithCount }).send(res);
});

/**
 * @desc    Create category
 * @route   POST /api/v1/restaurants/:restaurantId/categories
 * @access  Private
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { name, description, icon } = req.body;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  // Check if category name already exists
  const existingCategory = await Category.findOne({
    restaurant: restaurantId,
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  });
  if (existingCategory) {
    throw ApiError.conflict('A category with this name already exists');
  }

  // Get next order number
  const lastCategory = await Category.findOne({ restaurant: restaurantId })
    .sort({ order: -1 });
  const order = lastCategory ? lastCategory.order + 1 : 0;

  const category = await Category.create({
    restaurant: restaurantId,
    name,
    description,
    icon,
    order,
  });

  // Update restaurant stats
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { 'stats.totalCategories': 1 },
  });

  logger.info(`Category created: ${category.name} for restaurant ${restaurantId}`);

  ApiResponse.created(category, 'Category created successfully').send(res);
});

/**
 * @desc    Update category
 * @route   PUT /api/v1/restaurants/:restaurantId/categories/:categoryId
 * @access  Private
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { restaurantId, categoryId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  let category = await Category.findOne({
    _id: categoryId,
    restaurant: restaurantId,
  });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // Check if new name conflicts
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({
      restaurant: restaurantId,
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
      _id: { $ne: categoryId },
    });
    if (existingCategory) {
      throw ApiError.conflict('A category with this name already exists');
    }
  }

  // Only update allowed fields (whitelist approach)
  const allowedFields = ['name', 'description', 'icon', 'image', 'order', 'isActive'];
  const updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  category = await Category.findByIdAndUpdate(
    categoryId,
    updateData,
    { new: true, runValidators: true }
  );

  ApiResponse.success(category, 'Category updated successfully').send(res);
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/restaurants/:restaurantId/categories/:categoryId
 * @access  Private
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { restaurantId, categoryId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  const category = await Category.findOne({
    _id: categoryId,
    restaurant: restaurantId,
  });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // Delete all items in this category
  const deletedItems = await MenuItem.deleteMany({ category: categoryId });

  // Delete category
  await Category.findByIdAndDelete(categoryId);

  // Update restaurant stats
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: {
      'stats.totalCategories': -1,
      'stats.totalMenuItems': -deletedItems.deletedCount,
    },
  });

  logger.info(`Category deleted: ${category.name}`);

  ApiResponse.success(null, 'Category deleted successfully').send(res);
});

/**
 * @desc    Reorder categories
 * @route   PUT /api/v1/restaurants/:restaurantId/categories/reorder
 * @access  Private
 */
export const reorderCategories = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { categories } = req.body; // Array of { id, order }

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  // Update each category's order
  await Promise.all(
    categories.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order })
    )
  );

  const updatedCategories = await Category.find({ restaurant: restaurantId })
    .sort({ order: 1 });

  ApiResponse.success({ categories: updatedCategories }, 'Categories reordered').send(res);
});

// ============ MENU ITEMS ============

/**
 * @desc    Get all items for a category
 * @route   GET /api/v1/restaurants/:restaurantId/categories/:categoryId/items
 * @access  Private
 */
export const getMenuItems = asyncHandler(async (req, res) => {
  const { restaurantId, categoryId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  const items = await MenuItem.find({ category: categoryId })
    .sort({ order: 1, createdAt: 1 });

  ApiResponse.success({ items }).send(res);
});

/**
 * @desc    Get all items for a restaurant
 * @route   GET /api/v1/restaurants/:restaurantId/items
 * @access  Private
 */
export const getAllMenuItems = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  const items = await MenuItem.find({ restaurant: restaurantId })
    .populate('category', 'name')
    .sort({ 'category.order': 1, order: 1 });

  ApiResponse.success({ items }).send(res);
});

/**
 * @desc    Create menu item
 * @route   POST /api/v1/restaurants/:restaurantId/categories/:categoryId/items
 * @access  Private
 */
export const createMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, categoryId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  // Verify category exists
  const category = await Category.findOne({
    _id: categoryId,
    restaurant: restaurantId,
  });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // Check user's subscription limits
  const itemCount = await MenuItem.countDocuments({ restaurant: restaurantId });
  const user = await req.user;
  if (itemCount >= user.subscription.features.maxMenuItems) {
    throw ApiError.forbidden(
      `You have reached the maximum number of menu items (${user.subscription.features.maxMenuItems}) for your plan.`
    );
  }

  // Get next order number
  const lastItem = await MenuItem.findOne({ category: categoryId })
    .sort({ order: -1 });
  const order = lastItem ? lastItem.order + 1 : 0;

  const item = await MenuItem.create({
    ...req.body,
    restaurant: restaurantId,
    category: categoryId,
    order,
  });

  // Update stats
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { 'stats.totalMenuItems': 1 },
  });
  await Category.findByIdAndUpdate(categoryId, {
    $inc: { itemCount: 1 },
  });

  logger.info(`Menu item created: ${item.name}`);

  ApiResponse.created(item, 'Menu item created successfully').send(res);
});

/**
 * @desc    Update menu item
 * @route   PUT /api/v1/restaurants/:restaurantId/items/:itemId
 * @access  Private
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  let item = await MenuItem.findOne({
    _id: itemId,
    restaurant: restaurantId,
  });
  if (!item) {
    throw ApiError.notFound('Menu item not found');
  }

  // If category is being changed, update counts
  if (req.body.category && req.body.category !== item.category.toString()) {
    await Category.findByIdAndUpdate(item.category, { $inc: { itemCount: -1 } });
    await Category.findByIdAndUpdate(req.body.category, { $inc: { itemCount: 1 } });
  }

  // Only update allowed fields (whitelist approach)
  const allowedFields = [
    'name', 'description', 'price', 'salePrice', 'image', 'images',
    'category', 'order', 'badges', 'variants', 'addons', 'nutritionInfo',
    'preparationTime', 'isActive', 'isAvailable'
  ];
  const updateData = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  item = await MenuItem.findByIdAndUpdate(
    itemId,
    updateData,
    { new: true, runValidators: true }
  );

  ApiResponse.success(item, 'Menu item updated successfully').send(res);
});

/**
 * @desc    Delete menu item
 * @route   DELETE /api/v1/restaurants/:restaurantId/items/:itemId
 * @access  Private
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  const item = await MenuItem.findOne({
    _id: itemId,
    restaurant: restaurantId,
  });
  if (!item) {
    throw ApiError.notFound('Menu item not found');
  }

  await MenuItem.findByIdAndDelete(itemId);

  // Update stats
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { 'stats.totalMenuItems': -1 },
  });
  await Category.findByIdAndUpdate(item.category, {
    $inc: { itemCount: -1 },
  });

  logger.info(`Menu item deleted: ${item.name}`);

  ApiResponse.success(null, 'Menu item deleted successfully').send(res);
});

/**
 * @desc    Toggle item availability
 * @route   PATCH /api/v1/restaurants/:restaurantId/items/:itemId/availability
 * @access  Private
 */
export const toggleItemAvailability = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;

  // Verify access (owner or admin)
  await verifyRestaurantAccess(restaurantId, req.user);

  const item = await MenuItem.findOne({
    _id: itemId,
    restaurant: restaurantId,
  });
  if (!item) {
    throw ApiError.notFound('Menu item not found');
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  ApiResponse.success(item, `Item ${item.isAvailable ? 'available' : 'unavailable'}`).send(res);
});