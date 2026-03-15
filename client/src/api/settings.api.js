import apiClient from './axios.config';

export const settingsApi = {
  // Get profile
  getProfile: async () => {
    return apiClient.get('/settings/profile');
  },

  // Update profile
  updateProfile: async (data) => {
    return apiClient.put('/settings/profile', data);
  },

  // Check username availability
  checkUsernameAvailability: async (username) => {
    return apiClient.get(`/settings/username/${username}`);
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/settings/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete avatar
  deleteAvatar: async () => {
    return apiClient.delete('/settings/avatar');
  },

  // Update password
  updatePassword: async (data) => {
    return apiClient.put('/settings/password', data);
  },

  // Get billing details
  getBilling: async () => {
    return apiClient.get('/settings/billing');
  },

  // Update billing details
  updateBilling: async (data) => {
    return apiClient.put('/settings/billing', data);
  },

  // Get subscription
  getSubscription: async () => {
    return apiClient.get('/settings/subscription');
  },

  // Update subscription plan (no payment integration)
  updateSubscription: async (plan) => {
    return apiClient.put('/settings/subscription', { plan });
  },
};

export default settingsApi;
