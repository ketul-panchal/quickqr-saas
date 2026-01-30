import apiClient from './axios.config';

export const searchApi = {
  /**
   * Global search across restaurants, tables, and pages
   * @param {string} query - Search query string
   * @returns {Promise<{restaurants: Array, tables: Array, pages: Array}>}
   */
  search: async (query) => {
    return apiClient.get('/search', { params: { q: query } });
  },
};

export default searchApi;
