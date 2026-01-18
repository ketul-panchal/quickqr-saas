import express from 'express';
import {
  createRestaurant,
  getMyRestaurants,
  getRestaurant,
  getRestaurantBySlug,
  updateRestaurant,
  deleteRestaurant,
  checkSlugAvailability,
  uploadLogo,
  uploadCoverImage,
  togglePublish,
} from '../../controllers/restaurant.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.middleware.js';
import upload, { handleMulterError } from '../../middlewares/upload.middleware.js';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  checkSlugSchema,
} from '../../validators/restaurant.validator.js';

const router = express.Router();

// Public routes
router.get('/slug/:slug', getRestaurantBySlug);

// Protected routes
router.use(protect);

router.get('/check-slug', validate(checkSlugSchema), checkSlugAvailability);

router
  .route('/')
  .get(getMyRestaurants)
  .post(validate(createRestaurantSchema), createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .put(validate(updateRestaurantSchema), updateRestaurant)
  .delete(deleteRestaurant);

router.post('/:id/logo', upload.single('logo'), handleMulterError, uploadLogo);
router.post('/:id/cover', upload.single('cover'), handleMulterError, uploadCoverImage);
router.patch('/:id/publish', togglePublish);

export default router;