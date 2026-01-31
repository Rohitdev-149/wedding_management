const Wedding = require("../models/Wedding");
const Budget = require("../models/Budget");
const Timeline = require("../models/Timeline");
const ErrorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");
const { getPagination, getPaginationResponse } = require("../utils/pagination");

// @desc    Create new wedding
// @route   POST /api/v1/weddings
// @access  Private (Couple)
exports.createWedding = async (req, res, next) => {
  try {
    const {
      title,
      partner2Email,
      weddingDate,
      venue,
      description,
      theme,
      guestCount,
    } = req.body;

    logger.info(
      `Creating new wedding for user: ${req.user.id}, Title: ${title}`,
    );

    // Partner 1 is the logged-in user
    const partner1 = req.user.id;

    // Validate partner2 exists (if email provided)
    let partner2 = null;
    if (partner2Email) {
      const User = require("../models/User");
      const partner2User = await User.findOne({ email: partner2Email });

      if (!partner2User) {
        logger.warn(
          `Wedding creation failed - Partner not found: ${partner2Email}`,
        );
        return next(
          new ErrorResponse(`User with email ${partner2Email} not found`, 404),
        );
      }

      partner2 = partner2User._id;
    }

    // Create wedding data
    const weddingData = {
      title,
      couple: {
        partner1,
        partner2: partner2 || partner1, // Use partner1 as placeholder if partner2 not provided
      },
      weddingDate,
      venue,
      description,
      theme,
    };

    if (guestCount) {
      weddingData.guestCount = guestCount;
    }

    // Create wedding
    const wedding = await Wedding.create(weddingData);

    // Create associated budget
    await Budget.create({
      wedding: wedding._id,
      totalBudget: 0,
      expenses: [],
    });

    // Create associated timeline
    await Timeline.create({
      wedding: wedding._id,
      events: [],
    });

    // Populate couple details
    await wedding.populate("couple.partner1 couple.partner2", "fullName email");

    logger.info(`Wedding created successfully: ${wedding._id}`);

    res.status(201).json({
      success: true,
      message: "Wedding created successfully",
      data: wedding,
    });
  } catch (error) {
    logger.error(`Error creating wedding: ${error.message}`);
    next(error);
  }
};

// @desc    Get all weddings
// @route   GET /api/v1/weddings
// @access  Private (Admin, Planner)
exports.getAllWeddings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    logger.info(`Fetching all weddings - Page: ${page}, Limit: ${limit}`);

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by title or venue name
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "venue.name": { $regex: search, $options: "i" } },
      ];
    }

    // If user is planner, show only assigned weddings
    if (req.user.role === "planner") {
      query.planner = req.user.id;
    }

    const weddings = await Wedding.find(query)
      .populate(
        "couple.partner1 couple.partner2",
        "fullName email profileImage",
      )
      .populate("planner", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Wedding.countDocuments(query);

    logger.info(`Retrieved ${weddings.length} weddings from total ${total}`);

    res.status(200).json(getPaginationResponse(weddings, total, page, limit));
  } catch (error) {
    logger.error(`Error fetching weddings: ${error.message}`);
    next(error);
  }
};

// @desc    Get my weddings
// @route   GET /api/v1/weddings/my-weddings
// @access  Private (Couple)
exports.getMyWeddings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    logger.info(
      `Fetching weddings for user: ${req.user.id} - Page: ${page}, Limit: ${limit}`,
    );

    const weddings = await Wedding.find({
      $or: [
        { "couple.partner1": req.user.id },
        { "couple.partner2": req.user.id },
      ],
    })
      .populate(
        "couple.partner1 couple.partner2",
        "fullName email profileImage",
      )
      .populate("planner", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Wedding.countDocuments({
      $or: [
        { "couple.partner1": req.user.id },
        { "couple.partner2": req.user.id },
      ],
    });

    logger.info(
      `Retrieved ${weddings.length} weddings for user: ${req.user.id}`,
    );

    res.status(200).json(getPaginationResponse(weddings, total, page, limit));
  } catch (error) {
    logger.error(`Error fetching user weddings: ${error.message}`);
    next(error);
  }
};

// @desc    Get single wedding
// @route   GET /api/v1/weddings/:id
// @access  Private
exports.getWedding = async (req, res, next) => {
  try {
    logger.info(`Fetching wedding: ${req.params.id}`);

    const wedding = await Wedding.findById(req.params.id)
      .populate(
        "couple.partner1 couple.partner2",
        "fullName email phone profileImage",
      )
      .populate("planner", "fullName email phone profileImage");

    if (!wedding) {
      logger.warn(`Wedding not found: ${req.params.id}`);
      return next(new ErrorResponse("Wedding not found", 404));
    }

    // Check authorization
    const isCouple =
      wedding.couple.partner1._id.toString() === req.user.id ||
      wedding.couple.partner2._id.toString() === req.user.id;
    const isPlanner =
      wedding.planner && wedding.planner._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCouple && !isPlanner && !isAdmin) {
      logger.warn(
        `Unauthorized access attempt to wedding ${req.params.id} by user ${req.user.id}`,
      );
      return next(
        new ErrorResponse("Not authorized to access this wedding", 403),
      );
    }

    res.status(200).json({
      success: true,
      data: wedding,
    });
  } catch (error) {
    logger.error(`Error fetching wedding: ${error.message}`);
    next(error);
  }
};

// @desc    Update wedding
// @route   PUT /api/v1/weddings/:id
// @access  Private (Couple, Planner, Admin)
exports.updateWedding = async (req, res, next) => {
  try {
    logger.info(`Updating wedding: ${req.params.id}`);

    let wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      logger.warn(`Wedding not found for update: ${req.params.id}`);
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
      logger.warn(`Unauthorized update attempt for wedding ${req.params.id}`);
      return next(
        new ErrorResponse("Not authorized to update this wedding", 403),
      );
    }

    // Update wedding
    wedding = await Wedding.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("couple.partner1 couple.partner2 planner", "fullName email");

    logger.info(`Wedding updated successfully: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "Wedding updated successfully",
      data: wedding,
    });
  } catch (error) {
    logger.error(`Error updating wedding: ${error.message}`);
    next(error);
  }
};

// @desc    Delete wedding
// @route   DELETE /api/v1/weddings/:id
// @access  Private (Couple, Admin)
exports.deleteWedding = async (req, res, next) => {
  try {
    logger.info(`Deleting wedding: ${req.params.id}`);

    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      logger.warn(`Wedding not found for deletion: ${req.params.id}`);
      return next(new ErrorResponse("Wedding not found", 404));
    }

    // Check authorization - only couple or admin can delete
    const isCouple =
      wedding.couple.partner1.toString() === req.user.id ||
      wedding.couple.partner2.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCouple && !isAdmin) {
      logger.warn(`Unauthorized deletion attempt for wedding ${req.params.id}`);
      return next(
        new ErrorResponse("Not authorized to delete this wedding", 403),
      );
    }

    // Delete associated data
    await Budget.deleteOne({ wedding: wedding._id });
    await Timeline.deleteOne({ wedding: wedding._id });

    // Delete wedding
    await wedding.deleteOne();

    logger.info(`Wedding deleted successfully: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "Wedding deleted successfully",
      data: {},
    });
  } catch (error) {
    logger.error(`Error deleting wedding: ${error.message}`);
    next(error);
  }
};

// @desc    Assign planner to wedding
// @route   PUT /api/v1/weddings/:id/assign-planner
// @access  Private (Couple, Admin)
exports.assignPlanner = async (req, res, next) => {
  try {
    const { plannerId } = req.body;

    logger.info(`Assigning planner ${plannerId} to wedding ${req.params.id}`);

    if (!plannerId) {
      logger.warn(`Planner assignment failed - No planner ID provided`);
      return next(new ErrorResponse("Planner ID is required", 400));
    }

    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      logger.warn(`Wedding not found for planner assignment: ${req.params.id}`);
      return next(new ErrorResponse("Wedding not found", 404));
    }

    // Check authorization
    const isCouple =
      wedding.couple.partner1.toString() === req.user.id ||
      wedding.couple.partner2.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCouple && !isAdmin) {
      logger.warn(
        `Unauthorized planner assignment attempt for wedding ${req.params.id}`,
      );
      return next(new ErrorResponse("Not authorized to assign planner", 403));
    }

    // Verify planner exists and has correct role
    const User = require("../models/User");
    const planner = await User.findById(plannerId);

    if (!planner) {
      logger.warn(`Planner not found for assignment: ${plannerId}`);
      return next(new ErrorResponse("Planner not found", 404));
    }

    if (planner.role !== "planner") {
      logger.warn(`User is not a planner: ${plannerId}`);
      return next(new ErrorResponse("User is not a planner", 400));
    }

    // Assign planner
    wedding.planner = plannerId;
    await wedding.save();

    await wedding.populate("planner", "fullName email phone");

    logger.info(`Planner assigned successfully to wedding ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "Planner assigned successfully",
      data: wedding,
    });
  } catch (error) {
    logger.error(`Error assigning planner: ${error.message}`);
    next(error);
  }
};

// @desc    Remove planner from wedding
// @route   PUT /api/v1/weddings/:id/remove-planner
// @access  Private (Couple, Admin)
exports.removePlanner = async (req, res, next) => {
  try {
    const wedding = await Wedding.findById(req.params.id);

    if (!wedding) {
      return next(new ErrorResponse("Wedding not found", 404));
    }

    // Check authorization
    const isCouple =
      wedding.couple.partner1.toString() === req.user.id ||
      wedding.couple.partner2.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCouple && !isAdmin) {
      return next(new ErrorResponse("Not authorized to remove planner", 403));
    }

    wedding.planner = null;
    await wedding.save();

    res.status(200).json({
      success: true,
      message: "Planner removed successfully",
      data: wedding,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update wedding status
// @route   PUT /api/v1/weddings/:id/status
// @access  Private (Couple, Planner, Admin)
exports.updateWeddingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new ErrorResponse("Status is required", 400));
    }

    const validStatuses = ["planning", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return next(new ErrorResponse("Invalid status", 400));
    }

    const wedding = await Wedding.findById(req.params.id);

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
      return next(new ErrorResponse("Not authorized to update status", 403));
    }

    wedding.status = status;
    await wedding.save();

    res.status(200).json({
      success: true,
      message: "Wedding status updated successfully",
      data: wedding,
    });
  } catch (error) {
    next(error);
  }
};
