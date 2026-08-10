const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        message: detail.message,
        path: detail.path[0]
      }));
      return res.status(400).json({ success: false, message: 'Validation error', errors: details });
    }

    req[property] = value;
    next();
  };
};

module.exports = { validateRequest };
