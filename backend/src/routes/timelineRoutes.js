const express = require("express");
const { body } = require("express-validator");
const {
  getTimeline,
  addEvent,
  updateEvent,
  deleteEvent,
  getEventsByType,
  getUpcomingEvents,
} = require("../controllers/timelineController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Validation rules
const addEventValidation = [
  body("title").trim().notEmpty().withMessage("Event title is required"),
  body("eventDate")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Please provide a valid date"),
  body("startTime").notEmpty().withMessage("Start time is required"),
  body("endTime").notEmpty().withMessage("End time is required"),
  body("eventType")
    .notEmpty()
    .withMessage("Event type is required")
    .isIn([
      "ceremony",
      "reception",
      "engagement",
      "mehendi",
      "sangeet",
      "haldi",
      "cocktail",
      "rehearsal",
      "other",
    ])
    .withMessage("Invalid event type"),
];

// Routes
router.get(
  "/wedding/:weddingId",
  protect,
  authorize("couple", "planner", "admin"),
  getTimeline,
);

router.get(
  "/wedding/:weddingId/events/upcoming",
  protect,
  authorize("couple", "planner", "admin"),
  getUpcomingEvents,
);

router.get(
  "/wedding/:weddingId/events/type/:eventType",
  protect,
  authorize("couple", "planner", "admin"),
  getEventsByType,
);

router.post(
  "/wedding/:weddingId/events",
  protect,
  authorize("couple", "planner", "admin"),
  addEventValidation,
  validate,
  addEvent,
);

router.put(
  "/wedding/:weddingId/events/:eventId",
  protect,
  authorize("couple", "planner", "admin"),
  updateEvent,
);

router.delete(
  "/wedding/:weddingId/events/:eventId",
  protect,
  authorize("couple", "admin"),
  deleteEvent,
);

module.exports = router;
