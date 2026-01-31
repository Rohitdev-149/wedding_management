const express = require("express");
const { body } = require("express-validator");
const {
  createBooking,
  getWeddingBookings,
  getVendorBookings,
  getBooking,
  updateBookingStatus,
  updatePayment,
  cancelBooking,
  addReview,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body("wedding").notEmpty().withMessage("Wedding ID is required"),
  body("vendor").notEmpty().withMessage("Vendor ID is required"),
  body("service").trim().notEmpty().withMessage("Service is required"),
  body("serviceDate")
    .notEmpty()
    .withMessage("Service date is required")
    .isISO8601()
    .withMessage("Please provide a valid date"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number"),
];

const reviewValidation = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

// Routes
router.post(
  "/",
  protect,
  authorize("couple", "admin"),
  createBookingValidation,
  validate,
  createBooking,
);

router.get("/my-bookings", protect, authorize("vendor"), getVendorBookings);

router.get(
  "/wedding/:weddingId",
  protect,
  authorize("couple", "planner", "admin"),
  getWeddingBookings,
);

router.get("/:id", protect, getBooking);

router.put(
  "/:id/status",
  protect,
  authorize("vendor", "admin"),
  updateBookingStatus,
);

router.put(
  "/:id/payment",
  protect,
  authorize("couple", "admin"),
  updatePayment,
);

router.put("/:id/cancel", protect, cancelBooking);

router.put(
  "/:id/review",
  protect,
  authorize("couple"),
  reviewValidation,
  validate,
  addReview,
);

module.exports = router;
