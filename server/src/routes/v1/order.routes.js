import express from 'express';
import {
  placeOrder,
  trackOrder,
  getRestaurantOrders,
  getOrderDetails,
  updateOrderStatus,
  getOrdersSummary,
} from '../../controllers/order.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Public routes (for customers)
router.post('/place', placeOrder);
router.get('/track/:orderNumber', trackOrder);

// Protected routes (for restaurant owners)
router.use(protect);
router.get('/', getRestaurantOrders);
router.get('/summary', getOrdersSummary);
router.get('/:orderId', getOrderDetails);
router.patch('/:orderId/status', updateOrderStatus);

export default router;