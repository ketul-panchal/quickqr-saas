import Joi from 'joi';

export const registerSchema = {
  body: Joi.object().keys({
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
    }),
    password: Joi.string().min(8).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Please confirm your password',
    }),
    phone: Joi.string().optional(),
  }),
};

export const loginSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
    rememberMe: Joi.boolean().optional(),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
    }),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object().keys({
    password: Joi.string().min(8).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Please confirm your password',
    }),
  }),
  params: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const updatePasswordSchema = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required',
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Please confirm your password',
    }),
  }),
};