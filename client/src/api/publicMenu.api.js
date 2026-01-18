import apiClient from './axios.config';

export const publicMenuApi = {
  // Get public menu by slug
  getMenu: async (slug) => {
    return apiClient.get(`/menu/${slug}`);
  },

  // Get single item details
  getItem: async (slug, itemId) => {
    return apiClient.get(`/menu/${slug}/item/${itemId}`);
  },
};

export default publicMenuApi;