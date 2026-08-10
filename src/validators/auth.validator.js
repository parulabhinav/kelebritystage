const Joi = require('joi');

const authValidator = {
  requestOTP: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    email: Joi.string().email().optional(),
    type: Joi.string().valid('login', 'register', 'password_reset', 'verify_phone', 'verify_email').optional()
  }),

  verifyOTP: Joi.object({
    phoneNumber: Joi.string().required(),
    code: Joi.string().length(6).required(),
    type: Joi.string().optional(),
    name: Joi.string().max(100).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('user', 'celebrity').optional()
  }),

  register: Joi.object({
    phoneNumber: Joi.string().required(),
    name: Joi.string().max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'celebrity').optional()
  }),

  login: Joi.object({
    emailOrPhone: Joi.string().required(),
    password: Joi.string().required()
  })
};

module.exports = { authValidator };
