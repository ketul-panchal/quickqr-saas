import apiClient from './axios.config';

export const dashboardApi = {
  // Get dashboard stats
  getStats: async () => {
    return apiClient.get('/dashboard/stats');
  },

  // Get orders chart data
  getOrdersChart: async (range = 'week') => {
    return apiClient.get('/dashboard/orders-chart', {
      params: { range },
    });
  },

  // Get scans chart data
  getScansChart: async (range = 'month') => {
    return apiClient.get('/dashboard/scans-chart', {
      params: { range },
    });
  },

  // Get recent orders
  getRecentOrders: async () => {
    return apiClient.get('/dashboard/recent-orders');
  },

  // Get popular items
  getPopularItems: async () => {
    return apiClient.get('/dashboard/popular-items');
  },
};

export default dashboardApi;
