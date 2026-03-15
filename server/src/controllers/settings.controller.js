import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Subscription plan configurations (no payment integration yet)
const SUBSCRIPTION_PLANS = {
  free: {
    features: {
      maxRestaurants: 1,
      maxMenuItems: 50,
      maxScansPerMonth: 500,
      customBranding: false,
      analytics: false,
      prioritySupport: false,
    },
  },
  starter: {
    features: {
      maxRestaurants: 3,
      maxMenuItems: 200,
      maxScansPerMonth: 5000,
      customBranding: false,
      analytics: true,
      prioritySupport: false,
    },
  },
  professional: {
    features: {
      maxRestaurants: 10,
      maxMenuItems: 1000,
      maxScansPerMonth: 50000,
      customBranding: true,
      analytics: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    features: {
      maxRestaurants: 999,
      maxMenuItems: 9999,
      maxScansPerMonth: 999999,
      customBranding: true,
      analytics: true,
      prioritySupport: true,
    },
  },
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/settings/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(user.toPublicProfile(), 'Profile retrieved successfully').send(res);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/settings/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, username } = req.body;

  // Check if username is already taken (if provided)
  if (username) {
    const existingUser = await User.findOne({ 
      username: username.toLowerCase(),
      _id: { $ne: req.user.id }
    });
    
    if (existingUser) {
      throw ApiError.conflict('Username is already taken');
    }
  }

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (username !== undefined) updateData.username = username ? username.toLowerCase() : null;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  logger.info(`Profile updated for user: ${user.email}`);

  ApiResponse.success(user.toPublicProfile(), 'Profile updated successfully').send(res);
});

/**
 * @desc    Check username availability
 * @route   GET /api/v1/settings/username/:username
 * @access  Private
 */
export const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username || username.length < 3) {
    throw ApiError.badRequest('Username must be at least 3 characters');
  }

  const existingUser = await User.findOne({ 
    username: username.toLowerCase(),
    _id: { $ne: req.user.id }
  });

  const isAvailable = !existingUser;

  ApiResponse.success(
    { username, isAvailable },
    isAvailable ? 'Username is available' : 'Username is taken'
  ).send(res);
});

/**
 * @desc    Upload avatar
 * @route   POST /api/v1/settings/avatar
 * @access  Private
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image file');
  }

  // Delete old avatar if exists
  const user = await User.findById(req.user.id);
  if (user.avatar) {
    const oldAvatarPath = path.join(__dirname, '../../uploads', path.basename(user.avatar));
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  // Update user with new avatar
  const avatarUrl = `/uploads/${req.file.filename}`;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: avatarUrl },
    { new: true }
  );

  logger.info(`Avatar uploaded for user: ${updatedUser.email}`);

  ApiResponse.success(
    { avatar: avatarUrl, user: updatedUser.toPublicProfile() },
    'Avatar uploaded successfully'
  ).send(res);
});

/**
 * @desc    Delete avatar
 * @route   DELETE /api/v1/settings/avatar
 * @access  Private
 */
export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Delete avatar file if exists
  if (user.avatar) {
    const avatarPath = path.join(__dirname, '../../uploads', path.basename(user.avatar));
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }
  }

  // Update user to remove avatar
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: null },
    { new: true }
  );

  logger.info(`Avatar deleted for user: ${updatedUser.email}`);

  ApiResponse.success(updatedUser.toPublicProfile(), 'Avatar deleted successfully').send(res);
});

/**
 * @desc    Update password
 * @route   PUT /api/v1/settings/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('New password and confirm password do not match');
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password updated for user: ${user.email}`);

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

/**
 * @desc    Get billing details
 * @route   GET /api/v1/settings/billing
 * @access  Private
 */
export const getBilling = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const billing = user.billing || {
    type: 'personal',
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };

  ApiResponse.success(billing, 'Billing details retrieved successfully').send(res);
});

/**
 * @desc    Update billing details
 * @route   PUT /api/v1/settings/billing
 * @access  Private
 */
export const updateBilling = asyncHandler(async (req, res) => {
  const { type, name, address, city, state, postalCode, country } = req.body;

  const billingData = {
    type: type || 'personal',
    name: name || '',
    address: address || '',
    city: city || '',
    state: state || '',
    postalCode: postalCode || '',
    country: country || '',
  };

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { billing: billingData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  logger.info(`Billing updated for user: ${user.email}`);

  ApiResponse.success(user.billing, 'Billing details updated successfully').send(res);
});

/**
 * @desc    Get current subscription
 * @route   GET /api/v1/settings/subscription
 * @access  Private
 */
export const getSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(user.subscription, 'Subscription retrieved successfully').send(res);
});

/**
 * @desc    Update subscription plan (no payment integration)
 * @route   PUT /api/v1/settings/subscription
 * @access  Private
 */
export const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  const planConfig = SUBSCRIPTION_PLANS[plan];
  if (!planConfig) {
    throw ApiError.badRequest('Invalid subscription plan');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.subscription = {
    ...user.subscription,
    plan,
    status: 'active',
    features: {
      ...user.subscription.features,
      ...planConfig.features,
    },
  };

  await user.save();

  logger.info(`Subscription updated for user: ${user.email} to plan: ${plan}`);

  ApiResponse.success(user.subscription, 'Subscription updated successfully').send(res);
});
