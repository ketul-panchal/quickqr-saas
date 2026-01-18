import apiClient from './axios.config';

export const authApi = {
  // Register new user
  register: async (data) => {
    return apiClient.post('/auth/register', data);
  },

  // Login user
  login: async (data) => {
    return apiClient.post('/auth/login', data);
  },

  // Logout user
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  // Get current user
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  // Update profile
  updateProfile: async (data) => {
    return apiClient.put('/auth/profile', data);
  },

  // Update password
  updatePassword: async (data) => {
    return apiClient.put('/auth/password', data);
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, data) => {
    return apiClient.put(`/auth/reset-password/${token}`, data);
  },
};

export default authApi;