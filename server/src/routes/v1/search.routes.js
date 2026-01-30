import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { globalSearch } from '../../controllers/search.controller.js';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/search
 * @desc    Global search across restaurants, tables, and pages
 * @access  Private
 */
router.get('/', globalSearch);

export default router;
