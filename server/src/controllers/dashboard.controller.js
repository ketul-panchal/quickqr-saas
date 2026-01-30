import Order from '../models/order.model.js';
import Restaurant from '../models/restaurant.model.js';
import MenuItem from '../models/menuItem.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

/**
 * @desc    Get dashboard overview stats
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's restaurants
  const restaurants = await Restaurant.find({ owner: userId }).select('_id name stats');
  const restaurantIds = restaurants.map(r => r._id);

  // Get total orders across all restaurants
  const totalOrders = await Order.countDocuments({ restaurant: { $in: restaurantIds } });

  // Get total revenue
  const revenueResult = await Order.aggregate([
    { $match: { restaurant: { $in: restaurantIds }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Get total scans (sum from all restaurants)
  const totalScans = restaurants.reduce((sum, r) => sum + (r.stats?.totalScans || 0), 0);

  // Get this month's stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const lastMonthStart = new Date(startOfMonth);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const lastMonthEnd = new Date(startOfMonth);

  // This month orders
  const thisMonthOrders = await Order.countDocuments({
    restaurant: { $in: restaurantIds },
    createdAt: { $gte: startOfMonth }
  });

  // Last month orders
  const lastMonthOrders = await Order.countDocuments({
    restaurant: { $in: restaurantIds },
    createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
  });

  // Calculate order change percentage
  const orderChange = lastMonthOrders > 0 
    ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
    : thisMonthOrders > 0 ? 100 : 0;

  ApiResponse.success({
    totalRestaurants: restaurants.length,
    totalOrders,
    totalRevenue,
    totalScans,
    thisMonthOrders,
    orderChange: parseFloat(orderChange),
  }).send(res);
});

/**
 * @desc    Get weekly orders chart data
 * @route   GET /api/v1/dashboard/orders-chart
 * @access  Private
 */
export const getOrdersChart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { range = 'week' } = req.query;

  const restaurants = await Restaurant.find({ owner: userId }).select('_id');
  const restaurantIds = restaurants.map(r => r._id);

  let startDate, groupFormat, labels;

  if (range === 'week') {
    // Last 7 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    groupFormat = { $dayOfWeek: '$createdAt' };
    labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  } else if (range === 'month') {
    // Last 30 days grouped by week
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    groupFormat = { $dayOfMonth: '$createdAt' };
  } else {
    // Last 12 months
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    groupFormat = { $month: '$createdAt' };
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  const ordersData = await Order.aggregate([
    {
      $match: {
        restaurant: { $in: restaurantIds },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: range === 'week' 
          ? { $dayOfWeek: '$createdAt' }
          : range === 'month'
          ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          : { $month: '$createdAt' },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Format data for chart
  let chartData = [];
  
  if (range === 'week') {
    // Create 7-day data
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayOfWeek = date.getDay() + 1; // MongoDB uses 1-7 (Sun-Sat)
      const dayData = ordersData.find(d => d._id === dayOfWeek);
      chartData.push({
        name: labels[date.getDay()],
        orders: dayData?.orders || 0,
        revenue: dayData?.revenue || 0
      });
    }
  } else if (range === 'month') {
    // Create 30-day data
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayData = ordersData.find(d => d._id === dateStr);
      chartData.push({
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        orders: dayData?.orders || 0,
        revenue: dayData?.revenue || 0
      });
    }
  } else {
    // Create 12-month data
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const month = date.getMonth() + 1;
      const monthData = ordersData.find(d => d._id === month);
      chartData.push({
        name: labels[date.getMonth()],
        orders: monthData?.orders || 0,
        revenue: monthData?.revenue || 0
      });
    }
  }

  const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);

  ApiResponse.success({
    chartData,
    totalOrders
  }).send(res);
});

/**
 * @desc    Get recent orders for dashboard
 * @route   GET /api/v1/dashboard/recent-orders
 * @access  Private
 */
export const getRecentOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const restaurants = await Restaurant.find({ owner: userId }).select('_id name');
  const restaurantIds = restaurants.map(r => r._id);

  const orders = await Order.find({ restaurant: { $in: restaurantIds } })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('restaurant', 'name');

  const formattedOrders = orders.map(order => ({
    id: order.orderNumber,
    orderId: order._id,
    restaurantId: order.restaurant._id,
    restaurantName: order.restaurant.name,
    table: `Table ${order.tableNumber}`,
    customerName: order.customerName,
    items: order.items.length,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt
  }));

  ApiResponse.success(formattedOrders).send(res);
});

/**
 * @desc    Get popular items
 * @route   GET /api/v1/dashboard/popular-items
 * @access  Private
 */
export const getPopularItems = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const restaurants = await Restaurant.find({ owner: userId }).select('_id');
  const restaurantIds = restaurants.map(r => r._id);

  // Aggregate order items to find most popular
  const popularItems = await Order.aggregate([
    { $match: { restaurant: { $in: restaurantIds }, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        orders: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { orders: -1 } },
    { $limit: 5 }
  ]);

  const formattedItems = popularItems.map(item => ({
    name: item._id,
    orders: item.orders,
    revenue: Math.round(item.revenue * 100) / 100
  }));

  ApiResponse.success(formattedItems).send(res);
});

/**
 * @desc    Get scans chart data (simulated based on orders for now)
 * @route   GET /api/v1/dashboard/scans-chart
 * @access  Private
 */
export const getScansChart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { range = 'month' } = req.query;

  const restaurants = await Restaurant.find({ owner: userId }).select('_id stats');
  const restaurantIds = restaurants.map(r => r._id);
  const totalScans = restaurants.reduce((sum, r) => sum + (r.stats?.totalScans || 0), 0);

  // For now, simulate scans based on order patterns (multiply by ~2 for menu views)
  let startDate;
  if (range === 'week') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
  } else if (range === 'month') {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
  } else {
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
  }
  startDate.setHours(0, 0, 0, 0);

  const ordersData = await Order.aggregate([
    {
      $match: {
        restaurant: { $in: restaurantIds },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Generate chart data
  const chartData = [];
  const daysCount = range === 'week' ? 7 : range === 'month' ? 30 : 365;
  
  for (let i = 0; i < Math.min(daysCount, 30); i++) {
    const date = new Date();
    date.setDate(date.getDate() - (Math.min(daysCount, 30) - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = ordersData.find(d => d._id === dateStr);
    
    // Simulate scans (orders * 2-3 random factor for menu views)
    const baseScans = (dayData?.orders || 0) * (2 + Math.random());
    
    chartData.push({
      name: `${date.getMonth() + 1}/${date.getDate()}`,
      scans: Math.round(baseScans + Math.random() * 5)
    });
  }

  ApiResponse.success({
    chartData,
    totalScans
  }).send(res);
});

export default {
  getDashboardStats,
  getOrdersChart,
  getRecentOrders,
  getPopularItems,
  getScansChart
};
