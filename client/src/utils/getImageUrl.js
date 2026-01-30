/**
 * Helper to get full image URL
 * Handles both absolute URLs and relative paths
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get full image URL from a potentially relative path
 * @param {string} url - The image URL (can be relative or absolute)
 * @returns {string} - Full image URL
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /uploads, prepend API URL
  if (url.startsWith('/uploads')) {
    return `${API_URL}${url}`;
  }
  
  // For other paths, just return as is
  return url;
};

export default getImageUrl;
