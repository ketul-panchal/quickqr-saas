import crypto from 'crypto';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import logger from '../config/logger.js';

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    subscription: {
      plan: 'free',
      status: 'trial',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      features: {
        maxRestaurants: 1,
        maxMenuItems: 50,
        maxScansPerMonth: 500,
        customBranding: false,
        analytics: false,
        prioritySupport: false,
      },
    },
  });

  logger.info(`New user registered: ${user.email}`);

  // Send token response
  sendTokenResponse(user, 201, res, 'Account created successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${user.email}`);

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear cookies
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  ApiResponse.success(null, 'Logged out successfully').send(res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(user.toPublicProfile(), 'User retrieved successfully').send(res);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      firstName,
      lastName,
      phone,
      avatar,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(user.toPublicProfile(), 'Profile updated successfully').send(res);
});

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

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
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if user exists or not
    return ApiResponse.success(null, 'If an account exists, a password reset link has been sent').send(res);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset link
  // const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

  logger.info(`Password reset requested for: ${user.email}`);

  ApiResponse.success(
    { resetToken }, // In production, don't send this - just for testing
    'If an account exists, a password reset link has been sent'
  ).send(res);
});

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset successful for: ${user.email}`);

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified for: ${user.email}`);

  ApiResponse.success(null, 'Email verified successfully').send(res);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    sendTokenResponse(user, 200, res, 'Token refreshed successfully');
  } catch (error) {
    throw ApiError.unauthorized('Invalid refresh token');
  }
});