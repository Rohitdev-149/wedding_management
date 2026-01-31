const Timeline = require("../models/Timeline");
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
      "Not authorized to access this wedding timeline",
      403,
    );
  }

  return wedding;
};

// @desc    Get timeline for a wedding
// @route   GET /api/v1/timelines/wedding/:weddingId
// @access  Private (Couple, Planner, Admin)
exports.getTimeline = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const timeline = await Timeline.findOne({ wedding: req.params.weddingId })
      .populate("events.attendees", "fullName email phone")
      .populate("events.vendors", "fullName email phone vendorDetails");

    if (!timeline) {
      return next(new ErrorResponse("Timeline not found", 404));
    }

    // Sort events by date and time
    timeline.events.sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.startTime.localeCompare(b.startTime);
    });

    res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add event to timeline
// @route   POST /api/v1/timelines/wedding/:weddingId/events
// @access  Private (Couple, Planner, Admin)
exports.addEvent = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      eventType,
      isMainEvent,
      attendees,
      vendors,
      notes,
    } = req.body;

    let timeline = await Timeline.findOne({ wedding: req.params.weddingId });

    if (!timeline) {
      return next(new ErrorResponse("Timeline not found", 404));
    }

    const newEvent = {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      location,
      eventType,
      isMainEvent: isMainEvent || false,
      attendees: attendees || [],
      vendors: vendors || [],
      notes,
      status: "planned",
    };

    timeline.events.push(newEvent);
    await timeline.save();

    await timeline.populate("events.attendees", "fullName email");
    await timeline.populate("events.vendors", "fullName email vendorDetails");

    res.status(201).json({
      success: true,
      message: "Event added to timeline successfully",
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/v1/timelines/wedding/:weddingId/events/:eventId
// @access  Private (Couple, Planner, Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const timeline = await Timeline.findOne({ wedding: req.params.weddingId });

    if (!timeline) {
      return next(new ErrorResponse("Timeline not found", 404));
    }

    const event = timeline.events.id(req.params.eventId);

    if (!event) {
      return next(new ErrorResponse("Event not found", 404));
    }

    // Update fields
    const allowedFields = [
      "title",
      "description",
      "eventDate",
      "startTime",
      "endTime",
      "location",
      "eventType",
      "isMainEvent",
      "attendees",
      "vendors",
      "status",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await timeline.save();
    await timeline.populate("events.attendees", "fullName email");
    await timeline.populate("events.vendors", "fullName email vendorDetails");

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/v1/timelines/wedding/:weddingId/events/:eventId
// @access  Private (Couple, Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    // Only couple or admin can delete
    if (req.user.role !== "couple" && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to delete events", 403));
    }

    const timeline = await Timeline.findOne({ wedding: req.params.weddingId });

    if (!timeline) {
      return next(new ErrorResponse("Timeline not found", 404));
    }

    const event = timeline.events.id(req.params.eventId);

    if (!event) {
      return next(new ErrorResponse("Event not found", 404));
    }

    event.deleteOne();
    await timeline.save();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events by type
// @route   GET /api/v1/timelines/wedding/:weddingId/events/type/:eventType
// @access  Private (Couple, Planner, Admin)
exports.getEventsByType = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const timeline = await Timeline.findOne({ wedding: req.params.weddingId })
      .populate("events.attendees", "fullName email")
      .populate("events.vendors", "fullName email vendorDetails");

    if (!timeline) {
      return next(new ErrorResponse("Timeline not found", 404));
    }

    const events = timeline.events.filter(
      (event) => event.eventType === req.params.eventType,
    );

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming events
// @route   GET /api/v1/timelines/wedding/:weddingId/events/upcoming
// @access  Private (Couple, Planner, Admin)
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const timeline = await Timeline.findOne({ wedding: req.params.weddingId })
      .populate("events.attendees", "fullName email")
      .populate("events.vendors", "fullName email vendorDetails");

    if (!timeline) {
      return next(new ErrorResponse("Timeline not found", 404));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = timeline.events
      .filter((event) => new Date(event.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    res.status(200).json({
      success: true,
      count: upcomingEvents.length,
      data: upcomingEvents,
    });
  } catch (error) {
    next(error);
  }
};
