const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401),
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new ErrorResponse("User not found", 404));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(
          new ErrorResponse("Your account has been deactivated", 403),
        );
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      console.error("Token:", token.substring(0, 50) + "...");
      return next(new ErrorResponse("Invalid or expired token", 401));
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403,
        ),
      );
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid but we continue anyway
        console.log("Optional auth: Invalid token");
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
