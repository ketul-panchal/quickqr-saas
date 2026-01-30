import express from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import {
  getDashboardStats,
  getEarningsChart,
  getUsersChart,
  getRecentUsers,
  getRecentTransactions,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus,
} from '../../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Chart data
router.get('/charts/earnings', getEarningsChart);
router.get('/charts/users', getUsersChart);

// Recent data (for dashboard)
router.get('/users/recent', getRecentUsers);
router.get('/transactions/recent', getRecentTransactions);

// User Management CRUD
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', toggleUserStatus);

// Restaurant Management CRUD
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/:id', getRestaurantById);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);
router.patch('/restaurants/:id/status', toggleRestaurantStatus);

export default router;

