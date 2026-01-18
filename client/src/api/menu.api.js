import apiClient from './axios.config';

export const menuApi = {
  // ============ CATEGORIES ============
  
  // Get all categories
  getCategories: async (restaurantId) => {
    return apiClient.get(`/restaurants/${restaurantId}/menu/categories`);
  },

  // Create category
  createCategory: async (restaurantId, data) => {
    return apiClient.post(`/restaurants/${restaurantId}/menu/categories`, data);
  },

  // Update category
  updateCategory: async (restaurantId, categoryId, data) => {
    return apiClient.put(`/restaurants/${restaurantId}/menu/categories/${categoryId}`, data);
  },

  // Delete category
  deleteCategory: async (restaurantId, categoryId) => {
    return apiClient.delete(`/restaurants/${restaurantId}/menu/categories/${categoryId}`);
  },

  // Reorder categories
  reorderCategories: async (restaurantId, categories) => {
    return apiClient.put(`/restaurants/${restaurantId}/menu/categories/reorder`, { categories });
  },

  // ============ MENU ITEMS ============

  // Get items by category
  getItemsByCategory: async (restaurantId, categoryId) => {
    return apiClient.get(`/restaurants/${restaurantId}/menu/categories/${categoryId}/items`);
  },

  // Get all items
  getAllItems: async (restaurantId) => {
    return apiClient.get(`/restaurants/${restaurantId}/menu/items`);
  },

  // Create item
  createItem: async (restaurantId, categoryId, data) => {
    return apiClient.post(`/restaurants/${restaurantId}/menu/categories/${categoryId}/items`, data);
  },

  // Update item
  updateItem: async (restaurantId, itemId, data) => {
    return apiClient.put(`/restaurants/${restaurantId}/menu/items/${itemId}`, data);
  },

  // Delete item
  deleteItem: async (restaurantId, itemId) => {
    return apiClient.delete(`/restaurants/${restaurantId}/menu/items/${itemId}`);
  },

  // Toggle availability
  toggleAvailability: async (restaurantId, itemId) => {
    return apiClient.patch(`/restaurants/${restaurantId}/menu/items/${itemId}/availability`);
  },

  // Upload item image
  uploadItemImage: async (restaurantId, itemId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(`/restaurants/${restaurantId}/menu/items/${itemId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default menuApi;