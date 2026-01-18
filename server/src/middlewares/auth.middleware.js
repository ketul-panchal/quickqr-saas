import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw ApiError.unauthorized('Password recently changed. Please log in again.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired');
    }
    throw error;
  }
});

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Token invalid or expired, continue without user
      req.user = null;
    }
  }

  next();
});