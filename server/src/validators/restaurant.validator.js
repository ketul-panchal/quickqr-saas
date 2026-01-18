import Joi from 'joi';

export const createRestaurantSchema = {
  body: Joi.object().keys({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Restaurant name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    slug: Joi.string()
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Slug is required',
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        'string.min': 'Slug must be at least 3 characters',
        'string.max': 'Slug cannot exceed 50 characters',
      }),
    subtitle: Joi.string().max(200).allow('').optional(),
    description: Joi.string().max(1000).allow('').optional(),
    phone: Joi.string().max(20).allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    timing: Joi.string().max(100).allow('').optional(),
    address: Joi.object().keys({
      street: Joi.string().max(200).allow('').optional(),
      city: Joi.string().max(100).allow('').optional(),
      state: Joi.string().max(100).allow('').optional(),
      zipCode: Joi.string().max(20).allow('').optional(),
      country: Joi.string().max(100).allow('').optional(),
    }).optional(),
    template: Joi.string().valid('modern', 'classic', 'elegant', 'minimal').default('modern'),
    theme: Joi.object().keys({
      primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    }).optional(),
    cuisineTypes: Joi.array().items(Joi.string()).optional(),
    features: Joi.object().keys({
      hasDelivery: Joi.boolean(),
      hasTakeaway: Joi.boolean(),
      hasDineIn: Joi.boolean(),
      hasReservation: Joi.boolean(),
    }).optional(),
  }),
};

export const updateRestaurantSchema = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().min(2).max(100).optional(),
    slug: Joi.string()
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .min(3)
      .max(50)
      .optional(),
    subtitle: Joi.string().max(200).allow('').optional(),
    description: Joi.string().max(1000).allow('').optional(),
    phone: Joi.string().max(20).allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    timing: Joi.string().max(100).allow('').optional(),
    address: Joi.object().keys({
      street: Joi.string().max(200).allow('').optional(),
      city: Joi.string().max(100).allow('').optional(),
      state: Joi.string().max(100).allow('').optional(),
      zipCode: Joi.string().max(20).allow('').optional(),
      country: Joi.string().max(100).allow('').optional(),
    }).optional(),
    template: Joi.string().valid('modern', 'classic', 'elegant', 'minimal').optional(),
    theme: Joi.object().keys({
      primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    }).optional(),
    isActive: Joi.boolean().optional(),
    isPublished: Joi.boolean().optional(),
  }),
};

export const checkSlugSchema = {
  query: Joi.object().keys({
    slug: Joi.string().required(),
    excludeId: Joi.string().optional(),
  }),
};