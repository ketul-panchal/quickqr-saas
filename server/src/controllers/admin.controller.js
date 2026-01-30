import User from '../models/user.model.js';
import Restaurant from '../models/restaurant.model.js';
import Order from '../models/order.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/v1/admin/stats
 * @access  Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get total counts
  const [
    totalUsers,
    currentMonthUsers,
    totalRestaurants,
    currentMonthRestaurants,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Restaurant.countDocuments(),
    Restaurant.countDocuments({ createdAt: { $gte: startOfMonth } }),
  ]);

  // Get total scans from all restaurants
  const scansAgg = await Restaurant.aggregate([
    { $group: { _id: null, totalScans: { $sum: '$stats.totalScans' } } },
  ]);
  const totalScans = scansAgg[0]?.totalScans || 0;

  // Get current month scans (approximate from orders created this month)
  const currentMonthScansAgg = await Restaurant.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, scans: { $sum: '$stats.totalScans' } } },
  ]);
  const currentMonthScans = currentMonthScansAgg[0]?.scans || 0;

  // Get earnings (sum of all completed orders)
  const earningsAgg = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const totalEarnings = earningsAgg[0]?.total || 0;

  // Current month earnings
  const currentMonthEarningsAgg = await Order.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const currentMonthEarnings = currentMonthEarningsAgg[0]?.total || 0;

  ApiResponse.success({
    totalRestaurants,
    currentMonthRestaurants,
    totalScans,
    currentMonthScans,
    totalUsers,
    currentMonthUsers,
    totalEarnings,
    currentMonthEarnings,
  }).send(res);
});

/**
 * @desc    Get earnings chart data (last 7 days)
 * @route   GET /api/v1/admin/charts/earnings
 * @access  Admin
 */
export const getEarningsChart = asyncHandler(async (req, res) => {
  const days = 7;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const earnings = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: date, $lt: nextDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      earnings: earnings[0]?.total || 0,
    });
  }

  ApiResponse.success(data).send(res);
});

/**
 * @desc    Get weekly users chart data (last 7 days)
 * @route   GET /api/v1/admin/charts/users
 * @access  Admin
 */
export const getUsersChart = asyncHandler(async (req, res) => {
  const days = 7;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = await User.countDocuments({
      createdAt: { $gte: date, $lt: nextDate },
    });

    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      users: count,
    });
  }

  ApiResponse.success(data).send(res);
});

/**
 * @desc    Get recent registered users
 * @route   GET /api/v1/admin/users/recent
 * @access  Admin
 */
export const getRecentUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('firstName lastName email createdAt avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  ApiResponse.success(users).send(res);
});

/**
 * @desc    Get recent transactions (completed orders)
 * @route   GET /api/v1/admin/transactions/recent
 * @access  Admin
 */
export const getRecentTransactions = asyncHandler(async (req, res) => {
  const transactions = await Order.find({ status: 'completed' })
    .select('orderNumber customerName total createdAt restaurant')
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  ApiResponse.success(transactions).send(res);
});

// ==========================================
// USER MANAGEMENT CRUD
// ==========================================

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/v1/admin/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const status = req.query.status || '';

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  
  if (role) {
    query.role = role;
  }
  
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  ApiResponse.success({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }).send(res);
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/admin/users/:id
 * @access  Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');

  if (!user) {
    return ApiResponse.notFound('User not found').send(res);
  }

  // Get user's restaurant count
  const restaurantCount = await Restaurant.countDocuments({ owner: user._id });

  ApiResponse.success({
    ...user.toObject(),
    restaurantCount,
  }).send(res);
});

/**
 * @desc    Create new user
 * @route   POST /api/v1/admin/users
 * @access  Admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return ApiResponse.conflict('User with this email already exists').send(res);
  }

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    role: role || 'user',
    isActive: true,
    isEmailVerified: true, // Admin-created users are verified
  });

  const userResponse = user.toPublicProfile();
  ApiResponse.created(userResponse, 'User created successfully').send(res);
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/admin/users/:id
 * @access  Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, role, isActive, subscription } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return ApiResponse.notFound('User not found').send(res);
  }

  // Check email uniqueness if changed
  if (email && email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return ApiResponse.conflict('Email already in use').send(res);
    }
    user.email = email.toLowerCase();
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (subscription) {
    user.subscription = { ...user.subscription, ...subscription };
  }

  await user.save();

  ApiResponse.success(user.toPublicProfile(), 'User updated successfully').send(res);
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return ApiResponse.notFound('User not found').send(res);
  }

  // Prevent deleting super_admin
  if (user.role === 'super_admin') {
    return ApiResponse.forbidden('Cannot delete super admin').send(res);
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    return ApiResponse.forbidden('Cannot delete your own account').send(res);
  }

  await User.findByIdAndDelete(req.params.id);

  ApiResponse.success(null, 'User deleted successfully').send(res);
});

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/v1/admin/users/:id/status
 * @access  Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return ApiResponse.notFound('User not found').send(res);
  }

  // Prevent toggling super_admin
  if (user.role === 'super_admin') {
    return ApiResponse.forbidden('Cannot change super admin status').send(res);
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    return ApiResponse.forbidden('Cannot deactivate your own account').send(res);
  }

  user.isActive = !user.isActive;
  await user.save();

  ApiResponse.success(
    { isActive: user.isActive },
    `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  ).send(res);
});

// ==========================================
// RESTAURANT MANAGEMENT CRUD
// ==========================================

/**
 * @desc    Get all restaurants with pagination and filters
 * @route   GET /api/v1/admin/restaurants
 * @access  Admin
 */
export const getAllRestaurants = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const status = req.query.status || '';
  const published = req.query.published || '';

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
    ];
  }
  
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  if (published === 'published') {
    query.isPublished = true;
  } else if (published === 'unpublished') {
    query.isPublished = false;
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query)
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Restaurant.countDocuments(query),
  ]);

  ApiResponse.success({
    restaurants,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }).send(res);
});

/**
 * @desc    Get single restaurant by ID
 * @route   GET /api/v1/admin/restaurants/:id
 * @access  Admin
 */
export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .populate('owner', 'firstName lastName email phone');

  if (!restaurant) {
    return ApiResponse.notFound('Restaurant not found').send(res);
  }

  ApiResponse.success(restaurant).send(res);
});

/**
 * @desc    Update restaurant
 * @route   PUT /api/v1/admin/restaurants/:id
 * @access  Admin
 */
export const updateRestaurant = asyncHandler(async (req, res) => {
  const { name, subtitle, description, phone, email, isActive, isPublished } = req.body;

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    return ApiResponse.notFound('Restaurant not found').send(res);
  }

  if (name) restaurant.name = name;
  if (subtitle !== undefined) restaurant.subtitle = subtitle;
  if (description !== undefined) restaurant.description = description;
  if (phone !== undefined) restaurant.phone = phone;
  if (email !== undefined) restaurant.email = email;
  if (isActive !== undefined) restaurant.isActive = isActive;
  if (isPublished !== undefined) restaurant.isPublished = isPublished;

  await restaurant.save();

  ApiResponse.success(restaurant, 'Restaurant updated successfully').send(res);
});

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/v1/admin/restaurants/:id
 * @access  Admin
 */
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return ApiResponse.notFound('Restaurant not found').send(res);
  }

  await Restaurant.findByIdAndDelete(req.params.id);

  ApiResponse.success(null, 'Restaurant deleted successfully').send(res);
});

/**
 * @desc    Toggle restaurant active status
 * @route   PATCH /api/v1/admin/restaurants/:id/status
 * @access  Admin
 */
export const toggleRestaurantStatus = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  
  if (!restaurant) {
    return ApiResponse.notFound('Restaurant not found').send(res);
  }

  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();

  ApiResponse.success(
    { isActive: restaurant.isActive },
    `Restaurant ${restaurant.isActive ? 'activated' : 'deactivated'} successfully`
  ).send(res);
});
