/**
 * Global Error Handling Middleware
 * Must be defined last, after all other app.use() and routes
 */

const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context - wrapped in try-catch
  try {
    logger.error({
      message: err.message,
      method: req.method,
      path: req.path,
      statusCode: error.statusCode,
      stack: err.stack,
      userId: req.user?.id || "anonymous",
    });
  } catch (logErr) {
    console.error("Error logging failed:", logErr);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `A record with this ${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid authentication token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Authentication token has expired";
    error = { message, statusCode: 401 };
  }

  // Standardized error response
  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || "Internal Server Error",
    errors: err.errors || [],
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
