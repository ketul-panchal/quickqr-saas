import apiClient from './axios.config';

export const tableApi = {
  getTables: async (restaurantId) => {
    return apiClient.get(`/restaurants/${restaurantId}/tables`);
  },

  createTable: async (restaurantId, data) => {
    return apiClient.post(`/restaurants/${restaurantId}/tables`, data);
  },

  createBulkTables: async (restaurantId, data) => {
    return apiClient.post(`/restaurants/${restaurantId}/tables/bulk`, data);
  },

  updateTable: async (restaurantId, tableId, data) => {
    return apiClient.put(`/restaurants/${restaurantId}/tables/${tableId}`, data);
  },

  updateQRSettings: async (restaurantId, tableId, settings) => {
    return apiClient.patch(`/restaurants/${restaurantId}/tables/${tableId}/qr-settings`, settings);
  },

  deleteTable: async (restaurantId, tableId) => {
    return apiClient.delete(`/restaurants/${restaurantId}/tables/${tableId}`);
  },

  deleteBulkTables: async (restaurantId, tableIds) => {
    return apiClient.delete(`/restaurants/${restaurantId}/tables`, { data: { tableIds } });
  },
};

export default tableApi;