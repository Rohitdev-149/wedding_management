const Booking = require("../models/Booking");
const Wedding = require("../models/Wedding");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private (Couple)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      wedding,
      vendor,
      service,
      serviceDate,
      amount,
      advancePaid,
      bookingDetails,
      terms,
    } = req.body;

    // Verify wedding exists and user is part of the couple
    const weddingDoc = await Wedding.findById(wedding);
    if (!weddingDoc) {
      return next(new ErrorResponse("Wedding not found", 404));
    }

    const isCouple =
      weddingDoc.couple.partner1.toString() === req.user.id ||
      weddingDoc.couple.partner2.toString() === req.user.id;

    if (!isCouple && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          "Not authorized to create booking for this wedding",
          403,
        ),
      );
    }

    // Verify vendor exists and is a vendor
    const vendorUser = await User.findById(vendor);
    if (!vendorUser) {
      return next(new ErrorResponse("Vendor not found", 404));
    }
    if (vendorUser.role !== "vendor") {
      return next(new ErrorResponse("User is not a vendor", 400));
    }

    const bookingData = {
      wedding,
      vendor,
      couple: req.user.id,
      service,
      serviceDate,
      amount,
      advancePaid: advancePaid || 0,
      bookingDetails,
      terms,
      status: "pending",
      paymentStatus: advancePaid > 0 ? "partial" : "pending",
    };

    const booking = await Booking.create(bookingData);

    await booking.populate("vendor", "fullName email phone vendorDetails");
    await booking.populate("wedding", "title weddingDate venue");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for a wedding
// @route   GET /api/v1/bookings/wedding/:weddingId
// @access  Private (Couple, Planner, Admin)
exports.getWeddingBookings = async (req, res, next) => {
  try {
    const wedding = await Wedding.findById(req.params.weddingId);
    if (!wedding) {
      return next(new ErrorResponse("Wedding not found", 404));
    }

    // Check authorization
    const isCouple =
      wedding.couple.partner1.toString() === req.user.id ||
      wedding.couple.partner2.toString() === req.user.id;
    const isPlanner =
      wedding.planner && wedding.planner.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCouple && !isPlanner && !isAdmin) {
      return next(
        new ErrorResponse("Not authorized to access these bookings", 403),
      );
    }

    const { status, paymentStatus } = req.query;
    const query = { wedding: req.params.weddingId };

    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const bookings = await Booking.find(query)
      .populate("vendor", "fullName email phone vendorDetails")
      .populate("couple", "fullName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private (Vendor)
exports.getVendorBookings = async (req, res, next) => {
  try {
    if (req.user.role !== "vendor") {
      return next(new ErrorResponse("Only vendors can access this route", 403));
    }

    const { status, paymentStatus } = req.query;
    const query = { vendor: req.user.id };

    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const bookings = await Booking.find(query)
      .populate("wedding", "title weddingDate venue")
      .populate("couple", "fullName email phone")
      .sort({ serviceDate: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vendor", "fullName email phone vendorDetails")
      .populate("couple", "fullName email phone")
      .populate("wedding", "title weddingDate venue");

    if (!booking) {
      return next(new ErrorResponse("Booking not found", 404));
    }

    // Check authorization
    const isCouple = booking.couple._id.toString() === req.user.id;
    const isVendor = booking.vendor._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    const wedding = await Wedding.findById(booking.wedding._id);
    const isPlanner =
      wedding.planner && wedding.planner.toString() === req.user.id;

    if (!isCouple && !isVendor && !isPlanner && !isAdmin) {
      return next(
        new ErrorResponse("Not authorized to access this booking", 403),
      );
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/v1/bookings/:id/status
// @access  Private (Vendor)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new ErrorResponse("Status is required", 400));
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "declined",
    ];
    if (!validStatuses.includes(status)) {
      return next(new ErrorResponse("Invalid status", 400));
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse("Booking not found", 404));
    }

    // Only vendor can update status
    if (
      booking.vendor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new ErrorResponse("Not authorized to update booking status", 403),
      );
    }

    booking.status = status;
    await booking.save();

    await booking.populate("vendor", "fullName email vendorDetails");
    await booking.populate("wedding", "title weddingDate");

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment
// @route   PUT /api/v1/bookings/:id/payment
// @access  Private (Couple, Admin)
exports.updatePayment = async (req, res, next) => {
  try {
    const { advancePaid } = req.body;

    if (advancePaid === undefined) {
      return next(new ErrorResponse("Advance paid amount is required", 400));
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse("Booking not found", 404));
    }

    // Only couple or admin can update payment
    if (
      booking.couple.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(new ErrorResponse("Not authorized to update payment", 403));
    }

    booking.advancePaid = advancePaid;

    // Update payment status
    if (advancePaid === 0) {
      booking.paymentStatus = "pending";
    } else if (advancePaid >= booking.amount) {
      booking.paymentStatus = "completed";
    } else {
      booking.paymentStatus = "partial";
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private (Couple, Vendor, Admin)
exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse("Booking not found", 404));
    }

    // Check authorization
    const isCouple = booking.couple.toString() === req.user.id;
    const isVendor = booking.vendor.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCouple && !isVendor && !isAdmin) {
      return next(
        new ErrorResponse("Not authorized to cancel this booking", 403),
      );
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.user.id;
    booking.cancelledAt = Date.now();
    booking.cancellationReason = cancellationReason || "";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   PUT /api/v1/bookings/:id/review
// @access  Private (Couple)
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return next(new ErrorResponse("Rating is required", 400));
    }

    if (rating < 1 || rating > 5) {
      return next(new ErrorResponse("Rating must be between 1 and 5", 400));
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse("Booking not found", 404));
    }

    // Only couple can add review
    if (booking.couple.toString() !== req.user.id) {
      return next(
        new ErrorResponse("Not authorized to review this booking", 403),
      );
    }

    // Can only review completed bookings
    if (booking.status !== "completed") {
      return next(new ErrorResponse("Can only review completed bookings", 400));
    }

    booking.review = {
      rating,
      comment: comment || "",
      reviewDate: Date.now(),
    };

    await booking.save();

    // Update vendor rating
    const vendorBookings = await Booking.find({
      vendor: booking.vendor,
      "review.rating": { $exists: true },
    });

    const totalRating = vendorBookings.reduce(
      (sum, b) => sum + b.review.rating,
      0,
    );
    const avgRating = totalRating / vendorBookings.length;

    await User.findByIdAndUpdate(booking.vendor, {
      "vendorDetails.rating": avgRating.toFixed(1),
      "vendorDetails.totalReviews": vendorBookings.length,
    });

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
