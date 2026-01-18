import express from 'express';
import {
  startOnboarding,
  saveRestaurantInfo,
  saveMenuSetup,
  saveTheme,
  completeOnboarding,
  getOnboardingStatus,
} from '../../controllers/onboarding.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import {
  restaurantInfoSchema,
  menuSetupSchema,
  themeSchema,
} from '../../validators/onboarding.validator.js';

const router = express.Router();

// Get onboarding status
router.get('/status/:sessionId', getOnboardingStatus);

// Start onboarding
router.post('/start', startOnboarding);

// Save restaurant info (Step 2)
router.post(
  '/restaurant-info',
  validate(restaurantInfoSchema),
  saveRestaurantInfo
);

// Save menu setup (Step 3)
router.post('/menu-setup', validate(menuSetupSchema), saveMenuSetup);

// Save theme (Step 4)
router.post('/theme', validate(themeSchema), saveTheme);

// Complete onboarding (Step 5)
router.post('/complete', completeOnboarding);

export default router;