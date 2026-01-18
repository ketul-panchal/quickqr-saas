import crypto from 'crypto';

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a slug from text
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Generate unique slug
 * @param {string} text - Text to slugify
 * @returns {string} Unique slugified text
 */
export const generateUniqueSlug = (text) => {
  const baseSlug = slugify(text);
  const uniqueId = crypto.randomBytes(4).toString('hex');
  return `${baseSlug}-${uniqueId}`;
};

/**
 * Paginate results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination info
 */
export const paginate = (page = 1, limit = 10, total) => {
  const currentPage = Math.max(1, parseInt(page, 10));
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  return {
    currentPage,
    itemsPerPage,
    totalItems: total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    skip: (currentPage - 1) * itemsPerPage,
  };
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Pick specific properties from an object
 * @param {object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {object} New object with picked properties
 */
export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

/**
 * Omit specific properties from an object
 * @param {object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {object} New object without omitted properties
 */
export const omit = (obj, keys) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};