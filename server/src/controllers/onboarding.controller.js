import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import Onboarding from '../models/onboarding.model.js';
import { generateRandomString } from '../utils/helpers.js';

/**
 * Start new onboarding session
 */
export const startOnboarding = asyncHandler(async (req, res) => {
  const sessionId = generateRandomString(16);
  
  const onboarding = await Onboarding.create({
    sessionId,
    currentStep: 'welcome',
    completedSteps: ['welcome'],
  });
  
  ApiResponse.created({
    sessionId: onboarding.sessionId,
    currentStep: onboarding.currentStep,
    completedSteps: onboarding.completedSteps,
  }, 'Onboarding session started').send(res);
});

/**
 * Get onboarding status
 */
export const getOnboardingStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  const onboarding = await Onboarding.findOne({ sessionId });
  
  if (!onboarding) {
    throw ApiError.notFound('Onboarding session not found');
  }
  
  ApiResponse.success({
    sessionId: onboarding.sessionId,
    currentStep: onboarding.currentStep,
    completedSteps: onboarding.completedSteps,
    isCompleted: onboarding.isCompleted,
    restaurantInfo: onboarding.restaurantInfo,
    menuSetup: onboarding.menuSetup,
    themeSettings: onboarding.themeSettings,
  }).send(res);
});

/**
 * Save restaurant information (Step 2)
 */
export const saveRestaurantInfo = asyncHandler(async (req, res) => {
  const { sessionId, ...restaurantData } = req.body;
  
  const onboarding = await Onboarding.findOne({ sessionId });
  
  if (!onboarding) {
    throw ApiError.notFound('Onboarding session not found');
  }
  
  onboarding.restaurantInfo = restaurantData;
  onboarding.currentStep = 'menu_setup';
  
  if (!onboarding.completedSteps.includes('restaurant_info')) {
    onboarding.completedSteps.push('restaurant_info');
  }
  
  await onboarding.save();
  
  ApiResponse.success({
    sessionId: onboarding.sessionId,
    currentStep: onboarding.currentStep,
    completedSteps: onboarding.completedSteps,
    restaurantInfo: onboarding.restaurantInfo,
  }, 'Restaurant information saved').send(res);
});

/**
 * Save menu setup (Step 3)
 */
export const saveMenuSetup = asyncHandler(async (req, res) => {
  const { sessionId, categories, sampleItems } = req.body;
  
  const onboarding = await Onboarding.findOne({ sessionId });
  
  if (!onboarding) {
    throw ApiError.notFound('Onboarding session not found');
  }
  
  onboarding.menuSetup = { categories, sampleItems };
  onboarding.currentStep = 'theme_selection';
  
  if (!onboarding.completedSteps.includes('menu_setup')) {
    onboarding.completedSteps.push('menu_setup');
  }
  
  await onboarding.save();
  
  ApiResponse.success({
    sessionId: onboarding.sessionId,
    currentStep: onboarding.currentStep,
    completedSteps: onboarding.completedSteps,
    menuSetup: onboarding.menuSetup,
  }, 'Menu setup saved').send(res);
});

/**
 * Save theme settings (Step 4)
 */
export const saveTheme = asyncHandler(async (req, res) => {
  const { sessionId, ...themeData } = req.body;
  
  const onboarding = await Onboarding.findOne({ sessionId });
  
  if (!onboarding) {
    throw ApiError.notFound('Onboarding session not found');
  }
  
  onboarding.themeSettings = themeData;
  onboarding.currentStep = 'completion';
  
  if (!onboarding.completedSteps.includes('theme_selection')) {
    onboarding.completedSteps.push('theme_selection');
  }
  
  await onboarding.save();
  
  ApiResponse.success({
    sessionId: onboarding.sessionId,
    currentStep: onboarding.currentStep,
    completedSteps: onboarding.completedSteps,
    themeSettings: onboarding.themeSettings,
  }, 'Theme settings saved').send(res);
});

/**
 * Complete onboarding
 */
export const completeOnboarding = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  
  const onboarding = await Onboarding.findOne({ sessionId });
  
  if (!onboarding) {
    throw ApiError.notFound('Onboarding session not found');
  }
  
  // Validate all steps are completed
  const requiredSteps = ['welcome', 'restaurant_info', 'menu_setup', 'theme_selection'];
  const missingSteps = requiredSteps.filter(
    (step) => !onboarding.completedSteps.includes(step)
  );
  
  if (missingSteps.length > 0) {
    throw ApiError.badRequest(`Please complete these steps first: ${missingSteps.join(', ')}`);
  }
  
  if (!onboarding.completedSteps.includes('completion')) {
    onboarding.completedSteps.push('completion');
  }
  onboarding.isCompleted = true;
  
  await onboarding.save();
  
  // Here we would typically create the actual restaurant, user, etc.
  // For now, we return the completed onboarding data
  
  ApiResponse.success({
    sessionId: onboarding.sessionId,
    isCompleted: onboarding.isCompleted,
    completedSteps: onboarding.completedSteps,
    data: {
      restaurantInfo: onboarding.restaurantInfo,
      menuSetup: onboarding.menuSetup,
      themeSettings: onboarding.themeSettings,
    },
  }, 'Onboarding completed successfully!').send(res);
});