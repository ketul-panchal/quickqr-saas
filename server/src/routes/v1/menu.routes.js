import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getMenuItems,
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
} from '../../controllers/menu.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import upload, { handleMulterError } from '../../middlewares/upload.middleware.js';

const router = express.Router({ mergeParams: true });

// All routes are protected
router.use(protect);

// Category routes
router.route('/categories')
  .get(getCategories)
  .post(createCategory);

router.put('/categories/reorder', reorderCategories);

router.route('/categories/:categoryId')
  .put(updateCategory)
  .delete(deleteCategory);

// Menu item routes for a specific category
router.route('/categories/:categoryId/items')
  .get(getMenuItems)
  .post(createMenuItem);

// Menu item routes for restaurant
router.get('/items', getAllMenuItems);

router.route('/items/:itemId')
  .put(updateMenuItem)
  .delete(deleteMenuItem);

router.patch('/items/:itemId/availability', toggleItemAvailability);

// Image upload
router.post(
  '/items/:itemId/image',
  upload.single('image'),
  handleMulterError,
  async (req, res) => {
    // Handle image upload for menu item
    // Implementation similar to restaurant logo upload
  }
);

export default router;