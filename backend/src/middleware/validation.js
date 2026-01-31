const { validationResult } = require("express-validator");

// Validation result handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = [];

    errors.array().map((err) => {
      extractedErrors.push({
        field: err.path || err.param,
        message: err.msg,
      });
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: extractedErrors,
    });
  }

  next();
};
