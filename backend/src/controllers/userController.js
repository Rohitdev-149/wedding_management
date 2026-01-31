const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../config/cloudinary");

// @desc    Get all vendors
// @route   GET /api/v1/users/vendors
// @access  Public (so couples can browse vendors)
exports.getAllVendors = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const query = { role: "vendor", isActive: true };

    if (category) {
      query["vendorDetails.category"] = category;
    }

    let vendors = await User.find(query).select("-password");

    // Search filter
    if (search) {
      vendors = vendors.filter(
        (vendor) =>
          vendor.fullName.toLowerCase().includes(search.toLowerCase()) ||
          vendor.vendorDetails?.businessName
            ?.toLowerCase()
            .includes(search.toLowerCase()),
      );
    }

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor
// @route   GET /api/v1/users/vendors/:id
// @access  Public
exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await User.findOne({
      _id: req.params.id,
      role: "vendor",
    }).select("-password");

    if (!vendor) {
      return next(new ErrorResponse("Vendor not found", 404));
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload vendor images
// @route   POST /api/v1/users/vendors/:id/images
// @access  Private (Vendor owner or Admin)
exports.uploadVendorImages = async (req, res, next) => {
  try {
    if (!cloudinary.isCloudinaryConfigured()) {
      return next(
        new ErrorResponse(
          "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env",
          503,
        ),
      );
    }

    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse("No files uploaded", 400));
    }

    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== "vendor") {
      return next(new ErrorResponse("Vendor not found", 404));
    }

    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          "Not authorized to upload images for this vendor",
          403,
        ),
      );
    }

    const existingCount = (vendor.vendorDetails?.images || []).length;
    const maxPerVendor = 500;
    if (existingCount + req.files.length > maxPerVendor) {
      return next(
        new ErrorResponse(
          `Upload would exceed maximum of ${maxPerVendor} images per vendor`,
          400,
        ),
      );
    }

    if (!vendor.vendorDetails) {
      vendor.vendorDetails = {};
    }

    const folder = `wedding-vendors/${vendor._id}`;
    const uploadedUrls = [];

    for (const file of req.files) {
      try {
        // Use data URI for reliable upload (Cloudinary accepts data:image/xxx;base64,...)
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder,
          resource_type: "image",
          // Only use options supported at upload time (no format/quality/transformation here)
        });

        if (result && result.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      } catch (uploadErr) {
        const msg =
          uploadErr.error?.message ||
          uploadErr.message ||
          "Failed to upload one or more images";
        const code = uploadErr.error?.http_code || uploadErr.http_code || 400;
        return next(new ErrorResponse(msg, code));
      }
    }

    vendor.vendorDetails.images = [
      ...(vendor.vendorDetails?.images || []),
      ...uploadedUrls,
    ];
    await vendor.save();

    res
      .status(200)
      .json({ success: true, data: { images: vendor.vendorDetails.images } });
  } catch (error) {
    next(error);
  }
};
