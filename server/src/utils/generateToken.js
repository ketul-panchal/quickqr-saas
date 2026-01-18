import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Generate JWT Access Token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwt.secret,
    { expiresIn: '7d' }
  );
};

/**
 * Generate JWT Refresh Token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwt.secret,
    { expiresIn: '30d' }
  );
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Generate tokens and set cookies
 * @param {object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 * @param {string} message - Response message
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  // Remove password from output
  const userResponse = user.toPublicProfile ? user.toPublicProfile() : user;

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
    .json({
      success: true,
      message,
      data: {
        user: userResponse,
        accessToken,
      },
    });
};