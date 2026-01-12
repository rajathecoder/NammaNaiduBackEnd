const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return res.status(400).json({
      success: false,
      message: errorMessages || 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = { validate };


