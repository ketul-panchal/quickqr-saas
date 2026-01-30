import apiClient from './axios.config';

export const adminApi = {
  // Get dashboard stats
  getStats: async () => {
    return apiClient.get('/admin/stats');
  },

  // Get earnings chart data
  getEarningsChart: async () => {
    return apiClient.get('/admin/charts/earnings');
  },

  // Get users chart data
  getUsersChart: async () => {
    return apiClient.get('/admin/charts/users');
  },

  // Get recent users
  getRecentUsers: async () => {
    return apiClient.get('/admin/users/recent');
  },

  // Get recent transactions
  getRecentTransactions: async () => {
    return apiClient.get('/admin/transactions/recent');
  },

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  // Get all users with pagination
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/users?${queryString}`);
  },

  // Get single user
  getUser: async (id) => {
    return apiClient.get(`/admin/users/${id}`);
  },

  // Create user
  createUser: async (data) => {
    return apiClient.post('/admin/users', data);
  },

  // Update user
  updateUser: async (id, data) => {
    return apiClient.put(`/admin/users/${id}`, data);
  },

  // Delete user
  deleteUser: async (id) => {
    return apiClient.delete(`/admin/users/${id}`);
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    return apiClient.patch(`/admin/users/${id}/status`);
  },

  // ==========================================
  // RESTAURANT MANAGEMENT
  // ==========================================

  // Get all restaurants with pagination
  getRestaurants: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/restaurants?${queryString}`);
  },

  // Get single restaurant
  getRestaurant: async (id) => {
    return apiClient.get(`/admin/restaurants/${id}`);
  },

  // Update restaurant
  updateRestaurant: async (id, data) => {
    return apiClient.put(`/admin/restaurants/${id}`, data);
  },

  // Delete restaurant
  deleteRestaurant: async (id) => {
    return apiClient.delete(`/admin/restaurants/${id}`);
  },

  // Toggle restaurant status
  toggleRestaurantStatus: async (id) => {
    return apiClient.patch(`/admin/restaurants/${id}/status`);
  },
};

export default adminApi;

