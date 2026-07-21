const Joi = require('joi');

const validators = {
  // Register validation
  registerSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required()
  }),

  // Login validation
  loginSchema: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Quiz submission validation
  quizSchema: Joi.object({
    answers: Joi.array().items(Joi.string()).length(3).required()
  }),

  // Thread creation validation
  threadSchema: Joi.object({
    title: Joi.string().min(5).max(255).required(),
    category: Joi.string().valid('general', 'jobs', 'courses', 'wins', 'advice').required(),
    content: Joi.string().min(10).required()
  }),

  // Post creation validation
  postSchema: Joi.object({
    content: Joi.string().min(1).required()
  }),

  // Volunteer submission validation
  volunteerSchema: Joi.object({
    type: Joi.string().valid('mentor', 'trainer', 'operations').required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).required(),
    city: Joi.string().min(2).required(),
    experience: Joi.string().min(10),
    expertise: Joi.array().items(Joi.string()),
    areas: Joi.array().items(Joi.string())
  }),

  // Validate with schema
  validate: (data, schema) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      throw { status: 400, message: 'Validation failed', errors };
    }
    return value;
  }
};

module.exports = validators;
