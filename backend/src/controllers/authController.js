const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role, vendorDetails } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse("Email already registered", 400));
    }

    // Create user object
    const userData = {
      fullName,
      email,
      phone,
      password,
      role: role || "couple",
    };

    // Add vendor details if role is vendor
    if (role === "vendor" && vendorDetails) {
      userData.vendorDetails = vendorDetails;
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.getPublicProfile(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(new ErrorResponse("Please provide email and password", 400));
    }

    // Find user by email (include password field)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorResponse("Your account has been deactivated", 403));
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.getPublicProfile(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, profileImage, vendorDetails } = req.body;

    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (profileImage) updateData.profileImage = profileImage;

    // Only allow vendors to update vendor details
    if (req.user.role === "vendor" && vendorDetails) {
      updateData.vendorDetails = {
        ...req.user.vendorDetails,
        ...vendorDetails,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new ErrorResponse("Please provide current and new password", 400),
      );
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return next(new ErrorResponse("Current password is incorrect", 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse('Please provide email address', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('No user found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL - FRONTEND URL, not backend
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // In a real application, you would send an email here
    // For now, we'll just return the token in the response (NOT RECOMMENDED FOR PRODUCTION)
    
    console.log('========================================');
    console.log('PASSWORD RESET REQUEST');
    console.log('Email:', email);
    console.log('Reset Token:', resetToken);
    console.log('Reset URL:', resetUrl);
    console.log('========================================');

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
      // REMOVE THIS IN PRODUCTION - only for development/testing
      resetToken: resetToken,
      resetUrl: resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return next(new ErrorResponse("Please provide new password", 400));
    }

    if (newPassword.length < 6) {
      return next(
        new ErrorResponse("Password must be at least 6 characters", 400),
      );
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid or expired reset token", 400));
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token for auto-login
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: {
        user: user.getPublicProfile(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // In JWT, logout is handled client-side by removing the token
    // We just send a success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
