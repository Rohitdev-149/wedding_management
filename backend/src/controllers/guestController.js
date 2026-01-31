const Guest = require("../models/Guest");
const Wedding = require("../models/Wedding");
const ErrorResponse = require("../utils/errorResponse");

// Helper function to check wedding access
const checkWeddingAccess = async (weddingId, userId, userRole) => {
  const wedding = await Wedding.findById(weddingId);

  if (!wedding) {
    throw new ErrorResponse("Wedding not found", 404);
  }

  const isCouple =
    wedding.couple.partner1.toString() === userId ||
    wedding.couple.partner2.toString() === userId;
  const isPlanner = wedding.planner && wedding.planner.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isCouple && !isPlanner && !isAdmin) {
    throw new ErrorResponse(
      "Not authorized to access this wedding guests",
      403,
    );
  }

  return wedding;
};

// @desc    Get all guests for a wedding
// @route   GET /api/v1/guests/wedding/:weddingId
// @access  Private (Couple, Planner, Admin)
exports.getGuests = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const {
      rsvpStatus,
      category,
      side,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    // Build query
    const query = { wedding: req.params.weddingId };

    if (rsvpStatus) {
      query.rsvpStatus = rsvpStatus;
    }

    if (category) {
      query.category = category;
    }

    if (side) {
      query.side = side;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const guests = await Guest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Guest.countDocuments(query);

    // Calculate statistics
    const stats = {
      total: await Guest.countDocuments({ wedding: req.params.weddingId }),
      accepted: await Guest.countDocuments({
        wedding: req.params.weddingId,
        rsvpStatus: "accepted",
      }),
      declined: await Guest.countDocuments({
        wedding: req.params.weddingId,
        rsvpStatus: "declined",
      }),
      pending: await Guest.countDocuments({
        wedding: req.params.weddingId,
        rsvpStatus: "pending",
      }),
      maybe: await Guest.countDocuments({
        wedding: req.params.weddingId,
        rsvpStatus: "maybe",
      }),
    };

    res.status(200).json({
      success: true,
      count: guests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats,
      data: guests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single guest
// @route   GET /api/v1/guests/:id
// @access  Private (Couple, Planner, Admin)
exports.getGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return next(new ErrorResponse("Guest not found", 404));
    }

    await checkWeddingAccess(guest.wedding, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add guest
// @route   POST /api/v1/guests/wedding/:weddingId
// @access  Private (Couple, Planner, Admin)
exports.addGuest = async (req, res, next) => {
  try {
    const wedding = await checkWeddingAccess(
      req.params.weddingId,
      req.user.id,
      req.user.role,
    );

    const {
      fullName,
      email,
      phone,
      category,
      side,
      numberOfGuests,
      mealPreference,
      specialRequirements,
      notes,
    } = req.body;

    const guestData = {
      wedding: req.params.weddingId,
      fullName,
      email,
      phone,
      category: category || "friend",
      side,
      numberOfGuests: numberOfGuests || 1,
      mealPreference: mealPreference || "none",
      specialRequirements,
      notes,
    };

    const guest = await Guest.create(guestData);

    // Update wedding guest count
    const totalGuests = await Guest.aggregate([
      { $match: { wedding: wedding._id } },
      { $group: { _id: null, total: { $sum: "$numberOfGuests" } } },
    ]);

    wedding.guestCount.expected =
      totalGuests.length > 0 ? totalGuests[0].total : 0;
    await wedding.save();

    res.status(201).json({
      success: true,
      message: "Guest added successfully",
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add multiple guests (bulk import)
// @route   POST /api/v1/guests/wedding/:weddingId/bulk
// @access  Private (Couple, Planner, Admin)
exports.addGuestsBulk = async (req, res, next) => {
  try {
    const wedding = await checkWeddingAccess(
      req.params.weddingId,
      req.user.id,
      req.user.role,
    );

    const { guests } = req.body;

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return next(new ErrorResponse("Please provide an array of guests", 400));
    }

    // Add wedding ID to each guest
    const guestsData = guests.map((guest) => ({
      ...guest,
      wedding: req.params.weddingId,
      category: guest.category || "friend",
      numberOfGuests: guest.numberOfGuests || 1,
      mealPreference: guest.mealPreference || "none",
    }));

    const createdGuests = await Guest.insertMany(guestsData);

    // Update wedding guest count
    const totalGuests = await Guest.aggregate([
      { $match: { wedding: wedding._id } },
      { $group: { _id: null, total: { $sum: "$numberOfGuests" } } },
    ]);

    wedding.guestCount.expected =
      totalGuests.length > 0 ? totalGuests[0].total : 0;
    await wedding.save();

    res.status(201).json({
      success: true,
      message: `${createdGuests.length} guests added successfully`,
      count: createdGuests.length,
      data: createdGuests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update guest
// @route   PUT /api/v1/guests/:id
// @access  Private (Couple, Planner, Admin)
exports.updateGuest = async (req, res, next) => {
  try {
    let guest = await Guest.findById(req.params.id);

    if (!guest) {
      return next(new ErrorResponse("Guest not found", 404));
    }

    await checkWeddingAccess(guest.wedding, req.user.id, req.user.role);

    guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Update wedding guest counts if numberOfGuests changed
    if (req.body.numberOfGuests !== undefined) {
      const wedding = await Wedding.findById(guest.wedding);
      const totalGuests = await Guest.aggregate([
        { $match: { wedding: wedding._id } },
        { $group: { _id: null, total: { $sum: "$numberOfGuests" } } },
      ]);
      wedding.guestCount.expected =
        totalGuests.length > 0 ? totalGuests[0].total : 0;
      await wedding.save();
    }

    res.status(200).json({
      success: true,
      message: "Guest updated successfully",
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete guest
// @route   DELETE /api/v1/guests/:id
// @access  Private (Couple, Admin)
exports.deleteGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return next(new ErrorResponse("Guest not found", 404));
    }

    await checkWeddingAccess(guest.wedding, req.user.id, req.user.role);

    // Only couple or admin can delete
    if (req.user.role !== "couple" && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to delete guests", 403));
    }

    await guest.deleteOne();

    // Update wedding guest count
    const wedding = await Wedding.findById(guest.wedding);
    const totalGuests = await Guest.aggregate([
      { $match: { wedding: wedding._id } },
      { $group: { _id: null, total: { $sum: "$numberOfGuests" } } },
    ]);
    wedding.guestCount.expected =
      totalGuests.length > 0 ? totalGuests[0].total : 0;
    await wedding.save();

    res.status(200).json({
      success: true,
      message: "Guest deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update RSVP status
// @route   PUT /api/v1/guests/:id/rsvp
// @access  Private (Couple, Planner, Admin)
exports.updateRSVP = async (req, res, next) => {
  try {
    const { rsvpStatus } = req.body;

    if (!rsvpStatus) {
      return next(new ErrorResponse("RSVP status is required", 400));
    }

    const validStatuses = ["pending", "accepted", "declined", "maybe"];
    if (!validStatuses.includes(rsvpStatus)) {
      return next(new ErrorResponse("Invalid RSVP status", 400));
    }

    let guest = await Guest.findById(req.params.id);

    if (!guest) {
      return next(new ErrorResponse("Guest not found", 404));
    }

    await checkWeddingAccess(guest.wedding, req.user.id, req.user.role);

    guest.rsvpStatus = rsvpStatus;
    guest.rsvpDate = Date.now();
    await guest.save();

    // Update wedding confirmed guest count
    const wedding = await Wedding.findById(guest.wedding);
    const confirmedGuests = await Guest.aggregate([
      {
        $match: {
          wedding: wedding._id,
          rsvpStatus: "accepted",
        },
      },
      { $group: { _id: null, total: { $sum: "$numberOfGuests" } } },
    ]);
    wedding.guestCount.confirmed =
      confirmedGuests.length > 0 ? confirmedGuests[0].total : 0;
    await wedding.save();

    res.status(200).json({
      success: true,
      message: "RSVP status updated successfully",
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark invitation as sent
// @route   PUT /api/v1/guests/:id/send-invitation
// @access  Private (Couple, Planner, Admin)
exports.sendInvitation = async (req, res, next) => {
  try {
    let guest = await Guest.findById(req.params.id);

    if (!guest) {
      return next(new ErrorResponse("Guest not found", 404));
    }

    await checkWeddingAccess(guest.wedding, req.user.id, req.user.role);

    guest.invitationSent = true;
    guest.invitationSentDate = Date.now();
    await guest.save();

    res.status(200).json({
      success: true,
      message: "Invitation marked as sent",
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign table number
// @route   PUT /api/v1/guests/:id/assign-table
// @access  Private (Couple, Planner, Admin)
exports.assignTable = async (req, res, next) => {
  try {
    const { tableNumber } = req.body;

    if (tableNumber === undefined) {
      return next(new ErrorResponse("Table number is required", 400));
    }

    let guest = await Guest.findById(req.params.id);

    if (!guest) {
      return next(new ErrorResponse("Guest not found", 404));
    }

    await checkWeddingAccess(guest.wedding, req.user.id, req.user.role);

    guest.tableNumber = tableNumber;
    await guest.save();

    res.status(200).json({
      success: true,
      message: "Table assigned successfully",
      data: guest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get guest statistics
// @route   GET /api/v1/guests/wedding/:weddingId/stats
// @access  Private (Couple, Planner, Admin)
exports.getGuestStats = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const mongoose = require('mongoose');
    const weddingObjectId = new mongoose.Types.ObjectId(req.params.weddingId);

    // RSVP Statistics
    const rsvpStats = await Guest.aggregate([
      { $match: { wedding: weddingObjectId } },
      {
        $group: {
          _id: '$rsvpStatus',
          count: { $sum: 1 },
          totalGuests: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    // Category Statistics
    const categoryStats = await Guest.aggregate([
      { $match: { wedding: weddingObjectId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalGuests: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    // Side Statistics
    const sideStats = await Guest.aggregate([
      { $match: { wedding: weddingObjectId } },
      {
        $group: {
          _id: '$side',
          count: { $sum: 1 },
          totalGuests: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    // Meal Preference Statistics
    const mealStats = await Guest.aggregate([
      { $match: { wedding: weddingObjectId } },
      {
        $group: {
          _id: '$mealPreference',
          count: { $sum: 1 },
          totalGuests: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    // Invitation Statistics
    const invitationStats = {
      sent: await Guest.countDocuments({
        wedding: req.params.weddingId,
        invitationSent: true,
      }),
      notSent: await Guest.countDocuments({
        wedding: req.params.weddingId,
        invitationSent: false,
      }),
    };

    res.status(200).json({
      success: true,
      data: {
        rsvpStats,
        categoryStats,
        sideStats,
        mealStats,
        invitationStats,
      },
    });
  } catch (error) {
    next(error);
  }
};