import express from 'express';
import {
  getProfile,
  updateProfile,
  checkUsernameAvailability,
  uploadAvatar,
  deleteAvatar,
  updatePassword,
  getBilling,
  updateBilling,
} from '../../controllers/settings.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.middleware.js';
import upload, { handleMulterError } from '../../middlewares/upload.middleware.js';
import {
  updateProfileSchema,
  updatePasswordSchema,
  updateBillingSchema,
  checkUsernameSchema,
} from '../../validators/settings.validator.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router
  .route('/profile')
  .get(getProfile)
  .put(validate(updateProfileSchema), updateProfile);

// Username availability check
router.get('/username/:username', validate(checkUsernameSchema), checkUsernameAvailability);

// Avatar routes
router
  .route('/avatar')
  .post(upload.single('avatar'), handleMulterError, uploadAvatar)
  .delete(deleteAvatar);

// Password route
router.put('/password', validate(updatePasswordSchema), updatePassword);

// Billing routes
router
  .route('/billing')
  .get(getBilling)
  .put(validate(updateBillingSchema), updateBilling);

export default router;
