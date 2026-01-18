import Joi from 'joi';

export const restaurantInfoSchema = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    restaurantName: Joi.string().min(2).max(100).required(),
    ownerName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(20).required(),
    address: Joi.object().keys({
      street: Joi.string().max(200),
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      zipCode: Joi.string().max(20),
      country: Joi.string().max(100),
    }),
    cuisineType: Joi.array().items(Joi.string()).min(1).required(),
    description: Joi.string().max(500),
  }),
};

export const menuSetupSchema = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    categories: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().required(),
          description: Joi.string(),
          order: Joi.number(),
        })
      )
      .min(1)
      .required(),
    sampleItems: Joi.boolean().default(false),
  }),
};

export const themeSchema = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    theme: Joi.string()
      .valid('modern', 'classic', 'minimal', 'vibrant', 'dark', 'elegant')
      .required(),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    fontFamily: Joi.string(),
    logo: Joi.string().uri(),
  }),
};