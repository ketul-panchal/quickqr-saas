import express from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  getDashboardStats,
  getOrdersChart,
  getRecentOrders,
  getPopularItems,
  getScansChart
} from '../../controllers/dashboard.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Charts data
router.get('/orders-chart', getOrdersChart);
router.get('/scans-chart', getScansChart);

// Recent orders
router.get('/recent-orders', getRecentOrders);

// Popular items
router.get('/popular-items', getPopularItems);

export default router;
