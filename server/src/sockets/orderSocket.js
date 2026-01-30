import { emitToRestaurant, emitToUser } from './index.js';
import logger from '../config/logger.js';

/**
 * Emit new order notification to restaurant owner
 * @param {string} restaurantId - Restaurant ID
 * @param {string} ownerId - Restaurant owner's user ID
 * @param {object} orderData - Order details
 */
export const emitNewOrder = (restaurantId, ownerId, orderData) => {
  const notification = {
    type: 'new_order',
    title: 'New Order Received',
    message: `Table ${orderData.tableNumber} placed an order`,
    data: {
      orderId: orderData._id || orderData.id,
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      tableNumber: orderData.tableNumber,
      total: orderData.total,
      itemCount: orderData.items?.length || 0,
    },
    timestamp: new Date().toISOString(),
  };

  // Emit to restaurant room
  emitToRestaurant(restaurantId, 'order:new', notification);
  
  // Also emit to user directly
  emitToUser(ownerId, 'notification:new', notification);

  logger.info(`New order notification sent for order: ${orderData.orderNumber}`);
};

/**
 * Emit order status update
 * @param {string} restaurantId - Restaurant ID
 * @param {object} orderData - Updated order details
 */
export const emitOrderStatusUpdate = (restaurantId, orderData) => {
  const statusMessages = {
    confirmed: 'Order confirmed',
    preparing: 'Order is being prepared',
    ready: 'Order is ready for pickup',
    served: 'Order has been served',
    completed: 'Order completed',
    cancelled: 'Order was cancelled',
  };

  const notification = {
    type: 'order_status',
    title: 'Order Status Updated',
    message: statusMessages[orderData.status] || `Order status: ${orderData.status}`,
    data: {
      orderId: orderData._id || orderData.id,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      tableNumber: orderData.tableNumber,
    },
    timestamp: new Date().toISOString(),
  };

  emitToRestaurant(restaurantId, 'order:updated', notification);

  logger.info(`Order status update sent for order: ${orderData.orderNumber}, status: ${orderData.status}`);
};

export default { emitNewOrder, emitOrderStatusUpdate };
