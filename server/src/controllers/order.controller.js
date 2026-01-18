import Order from '../models/order.model.js';
import Restaurant from '../models/restaurant.model.js';
import MenuItem from '../models/menuItem.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { paginate } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * @desc    Place a new order (Public - Customer)
 * @route   POST /api/v1/orders/place
 * @access  Public
 */
export const placeOrder = asyncHandler(async (req, res) => {
  const { restaurantId, customerName, tableNumber, phone, message, items } = req.body;

  // Validate restaurant
  const restaurant = await Restaurant.findOne({ _id: restaurantId, isActive: true });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  // Validate and get items
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findOne({
      _id: item.menuItemId,
      restaurant: restaurantId,
      isActive: true,
      isAvailable: true,
    });

    if (!menuItem) {
      throw ApiError.badRequest(`Item "${item.name || item.menuItemId}" is not available`);
    }

    const price = menuItem.salePrice || menuItem.price;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: price,
      quantity: item.quantity,
      notes: item.notes || '',
      image: menuItem.image?.url || '',
    });
  }

  // Calculate total
  const tax = 0;
  const total = subtotal + tax;

  // Generate order number
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const orderCount = await Order.countDocuments({
    restaurant: restaurantId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const orderNumber = `ORD-${dateStr}-${String(orderCount + 1).padStart(3, '0')}${randomNum}`;

  // Create order
  const order = await Order.create({
    orderNumber,
    restaurant: restaurantId,
    customerName,
    tableNumber,
    phone,
    message,
    items: orderItems,
    subtotal,
    tax,
    total,
    status: 'pending',
  });

  // Update restaurant stats
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { 'stats.totalOrders': 1 },
  });

  logger.info(`New order placed: ${order.orderNumber} for restaurant ${restaurant.name}`);

  ApiResponse.created({
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    estimatedTime: 15,
  }, 'Order placed successfully').send(res);
});

/**
 * @desc    Get order status (Public - Customer)
 * @route   GET /api/v1/orders/track/:orderNumber
 * @access  Public
 */
export const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .select('orderNumber status items total estimatedTime createdAt')
    .populate('restaurant', 'name');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  ApiResponse.success(order).send(res);
});

/**
 * @desc    Get all orders for a restaurant (Dashboard)
 * @route   GET /api/v1/restaurants/:restaurantId/orders
 * @access  Private
 */
export const getRestaurantOrders = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 20, status, date } = req.query;
  const userId = req.user.id;

  // Verify ownership
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  // Build query
  const query = { restaurant: restaurantId };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const total = await Order.countDocuments(query);
  const pagination = paginate(page, limit, total);

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.itemsPerPage);

  // Get stats
  const stats = await Order.aggregate([
    { $match: { restaurant: restaurant._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$total' },
      },
    },
  ]);

  ApiResponse.success({
    orders,
    stats,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
    },
  }).send(res);
});

/**
 * @desc    Get single order details
 * @route   GET /api/v1/restaurants/:restaurantId/orders/:orderId
 * @access  Private
 */
export const getOrderDetails = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;
  const userId = req.user.id;

  // Verify ownership
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const order = await Order.findOne({ _id: orderId, restaurant: restaurantId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  ApiResponse.success(order).send(res);
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/restaurants/:restaurantId/orders/:orderId/status
 * @access  Private
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { restaurantId, orderId } = req.params;
  const { status, estimatedTime, cancelReason } = req.body;
  const userId = req.user.id;

  // Verify ownership
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const order = await Order.findOne({ _id: orderId, restaurant: restaurantId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Update status
  order.status = status;

  if (estimatedTime) {
    order.estimatedTime = estimatedTime;
  }

  if (status === 'completed') {
    order.completedAt = new Date();
  }

  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || 'Cancelled by restaurant';
  }

  await order.save();

  logger.info(`Order ${order.orderNumber} status updated to ${status}`);

  ApiResponse.success(order, 'Order status updated').send(res);
});

/**
 * @desc    Get today's orders summary
 * @route   GET /api/v1/restaurants/:restaurantId/orders/summary
 * @access  Private
 */
export const getOrdersSummary = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const userId = req.user.id;

  // Verify ownership
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const summary = await Order.aggregate([
    {
      $match: {
        restaurant: restaurant._id,
        createdAt: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
      },
    },
  ]);

  ApiResponse.success(summary[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  }).send(res);
});