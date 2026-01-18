import express from 'express';
import {
  getPublicMenu,
  getPublicMenuItem,
} from '../../controllers/publicMenu.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/:slug', getPublicMenu);
router.get('/:slug/item/:itemId', getPublicMenuItem);

export default router;