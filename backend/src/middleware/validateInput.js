/**
 * Enhanced Input Validation Middleware
 * Provides custom validators for common use cases
 */
const { body } = require("express-validator");

/**
 * Validate wedding date is in the future
 */
exports.validateWeddingDate = body("weddingDate")
  .isISO8601()
  .withMessage("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)")
  .custom((value) => {
    const weddingDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (weddingDate <= today) {
      throw new Error("Wedding date must be in the future");
    }
    return true;
  });

/**
 * Validate positive integer numbers
 */
exports.validatePositiveNumber = (fieldName) =>
  body(fieldName)
    .isInt({ min: 0 })
    .withMessage(`${fieldName} must be a positive number`);

/**
 * Validate strong password
 * Requires: 8+ chars, lowercase, uppercase, numbers, special chars optional
 */
exports.validatePassword = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage("Password must contain lowercase, uppercase, and numbers");

/**
 * Validate email format
 */
exports.validateEmail = body("email")
  .isEmail()
  .withMessage("Please provide a valid email address")
  .normalizeEmail();

/**
 * Validate phone number
 */
exports.validatePhone = body("phone")
  .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
  .withMessage("Please provide a valid phone number");

/**
 * Validate full name (at least 2 characters)
 */
exports.validateFullName = body("fullName")
  .trim()
  .isLength({ min: 2 })
  .withMessage("Full name must be at least 2 characters");

/**
 * Validate role
 */
exports.validateRole = body("role")
  .isIn(["couple", "admin", "planner", "vendor", "guest"])
  .withMessage(
    "Invalid role. Must be one of: couple, admin, planner, vendor, guest",
  );

module.exports.validationMiddleware = {
  validateWeddingDate: exports.validateWeddingDate,
  validatePositiveNumber: exports.validatePositiveNumber,
  validatePassword: exports.validatePassword,
  validateEmail: exports.validateEmail,
  validatePhone: exports.validatePhone,
  validateFullName: exports.validateFullName,
  validateRole: exports.validateRole,
};
