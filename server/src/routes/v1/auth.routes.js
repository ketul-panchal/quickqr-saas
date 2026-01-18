import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
} from '../../controllers/auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '../../validators/auth.validator.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect); // All routes below this are protected
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', validate(updatePasswordSchema), updatePassword);

export default router;