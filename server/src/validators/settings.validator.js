import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().min(1).max(50).trim(),
    lastName: Joi.string().min(1).max(50).trim(),
    phone: Joi.string().allow('', null).max(20).trim(),
    username: Joi.string()
      .allow('', null)
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot exceed 30 characters',
      }),
  }),
});

export const updatePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string()
      .min(8)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'New password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required',
      }),
  }),
});

export const updateBillingSchema = Joi.object({
  body: Joi.object({
    type: Joi.string().valid('personal', 'business').default('personal'),
    name: Joi.string().allow('', null).max(100).trim(),
    address: Joi.string().allow('', null).max(200).trim(),
    city: Joi.string().allow('', null).max(100).trim(),
    state: Joi.string().allow('', null).max(100).trim(),
    postalCode: Joi.string().allow('', null).max(20).trim(),
    country: Joi.string().allow('', null).max(100).trim(),
  }),
});

export const checkUsernameSchema = Joi.object({
  params: Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),
  }),
});
