import Restaurant from '../models/restaurant.model.js';
import Table from '../models/table.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// Static navigation pages for search
const navigationPages = [
  { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', category: 'navigation' },
  { name: 'My Restaurants', path: '/dashboard/restaurants', icon: 'Store', category: 'navigation' },
  { name: 'Add Restaurant', path: '/dashboard/restaurants/new', icon: 'Plus', category: 'navigation' },
  { name: 'Membership', path: '/dashboard/membership', icon: 'Crown', category: 'navigation' },
  { name: 'Transactions', path: '/dashboard/transactions', icon: 'Receipt', category: 'navigation' },
  { name: 'Settings', path: '/dashboard/settings', icon: 'Settings', category: 'navigation' },
];

/**
 * @desc    Global search across restaurants, tables, and pages
 * @route   GET /api/v1/search
 * @access  Private
 */
export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const userId = req.user.id;

  if (!q || q.trim().length < 2) {
    return ApiResponse.success({
      restaurants: [],
      tables: [],
      pages: [],
    }).send(res);
  }

  const searchTerm = q.trim();
  const searchRegex = new RegExp(searchTerm, 'i');

  // Search restaurants
  const restaurants = await Restaurant.find({
    owner: userId,
    $or: [
      { name: searchRegex },
      { slug: searchRegex },
    ],
  })
    .select('_id name slug logo isPublished')
    .limit(5)
    .lean();

  // Get all user's restaurants for table search
  const userRestaurantIds = await Restaurant.find({ owner: userId }).select('_id').lean();
  const restaurantIds = userRestaurantIds.map(r => r._id);

  // Search tables across all user's restaurants
  const tables = await Table.find({
    restaurant: { $in: restaurantIds },
    $or: [
      { name: searchRegex },
      { number: isNaN(searchTerm) ? -1 : parseInt(searchTerm, 10) },
    ],
  })
    .select('_id name number restaurant location')
    .populate('restaurant', 'name slug')
    .limit(5)
    .lean();

  // Search navigation pages
  const pages = navigationPages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  ApiResponse.success({
    restaurants: restaurants.map(r => ({
      _id: r._id,
      name: r.name,
      slug: r.slug,
      logo: r.logo,
      isPublished: r.isPublished,
      type: 'restaurant',
      path: `/dashboard/restaurants/${r._id}`,
    })),
    tables: tables.map(t => ({
      _id: t._id,
      name: t.name,
      number: t.number,
      location: t.location,
      restaurant: t.restaurant,
      type: 'table',
      path: `/dashboard/restaurants/${t.restaurant._id}/tables`,
    })),
    pages: pages.map(p => ({
      ...p,
      type: 'page',
    })),
  }).send(res);
});
