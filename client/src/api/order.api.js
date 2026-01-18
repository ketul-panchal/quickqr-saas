import apiClient from './axios.config';

export const orderApi = {
  // Place order (public - customer)
  placeOrder: async (data) => {
    return apiClient.post('/orders/place', data);
  },

  // Track order (public)
  trackOrder: async (orderNumber) => {
    return apiClient.get(`/orders/track/${orderNumber}`);
  },

  // Get restaurant orders (dashboard)
  getOrders: async (restaurantId, params) => {
    return apiClient.get(`/restaurants/${restaurantId}/orders`, { params });
  },

  // Get order details
  getOrderDetails: async (restaurantId, orderId) => {
    return apiClient.get(`/restaurants/${restaurantId}/orders/${orderId}`);
  },

  // Update order status
  updateStatus: async (restaurantId, orderId, data) => {
    return apiClient.patch(`/restaurants/${restaurantId}/orders/${orderId}/status`, data);
  },

  // Get orders summary
  getSummary: async (restaurantId) => {
    return apiClient.get(`/restaurants/${restaurantId}/orders/summary`);
  },
};

export default orderApi;