import apiClient from './axios.config';

export const restaurantApi = {
  // Create restaurant
  create: async (data) => {
    return apiClient.post('/restaurants', data);
  },

  // Get all my restaurants
  getMyRestaurants: async (params) => {
    return apiClient.get('/restaurants', { params });
  },

  // Get single restaurant
  getRestaurant: async (id) => {
    return apiClient.get(`/restaurants/${id}`);
  },

  // Get restaurant by slug (public)
  getBySlug: async (slug) => {
    return apiClient.get(`/restaurants/slug/${slug}`);
  },

  // Update restaurant
  update: async (id, data) => {
    return apiClient.put(`/restaurants/${id}`, data);
  },

  // Delete restaurant
  delete: async (id) => {
    return apiClient.delete(`/restaurants/${id}`);
  },

  // Check slug availability
  checkSlug: async (slug, excludeId) => {
    return apiClient.get('/restaurants/check-slug', {
      params: { slug, excludeId },
    });
  },

  // Upload logo
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post(`/restaurants/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Upload cover image
  uploadCover: async (id, file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return apiClient.post(`/restaurants/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Toggle publish
  togglePublish: async (id) => {
    return apiClient.patch(`/restaurants/${id}/publish`);
  },
};

export default restaurantApi;