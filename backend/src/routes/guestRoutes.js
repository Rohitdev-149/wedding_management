const express = require("express");
const { body } = require("express-validator");
const {
  getGuests,
  getGuest,
  addGuest,
  addGuestsBulk,
  updateGuest,
  deleteGuest,
  updateRSVP,
  sendInvitation,
  assignTable,
  getGuestStats,
} = require("../controllers/guestController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Validation rules
const addGuestValidation = [
  body("fullName").trim().notEmpty().withMessage("Guest name is required"),
  body("side")
    .notEmpty()
    .withMessage("Guest side is required")
    .isIn(["partner1", "partner2", "mutual"])
    .withMessage("Invalid guest side"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("category")
    .optional()
    .isIn(["family", "friend", "colleague", "other"])
    .withMessage("Invalid category"),
  body("mealPreference")
    .optional()
    .isIn(["veg", "non-veg", "vegan", "jain", "none"])
    .withMessage("Invalid meal preference"),
];

const updateRSVPValidation = [
  body("rsvpStatus")
    .notEmpty()
    .withMessage("RSVP status is required")
    .isIn(["pending", "accepted", "declined", "maybe"])
    .withMessage("Invalid RSVP status"),
];

// Routes
router.get(
  "/wedding/:weddingId",
  protect,
  authorize("couple", "planner", "admin"),
  getGuests,
);

router.get(
  "/wedding/:weddingId/stats",
  protect,
  authorize("couple", "planner", "admin"),
  getGuestStats,
);

router.post(
  "/wedding/:weddingId",
  protect,
  authorize("couple", "planner", "admin"),
  addGuestValidation,
  validate,
  addGuest,
);

router.post(
  "/wedding/:weddingId/bulk",
  protect,
  authorize("couple", "planner", "admin"),
  addGuestsBulk,
);

router
  .route("/:id")
  .get(protect, authorize("couple", "planner", "admin"), getGuest)
  .put(protect, authorize("couple", "planner", "admin"), updateGuest)
  .delete(protect, authorize("couple", "admin"), deleteGuest);

router.put(
  "/:id/rsvp",
  protect,
  authorize("couple", "planner", "admin"),
  updateRSVPValidation,
  validate,
  updateRSVP,
);

router.put(
  "/:id/send-invitation",
  protect,
  authorize("couple", "planner", "admin"),
  sendInvitation,
);

router.put(
  "/:id/assign-table",
  protect,
  authorize("couple", "planner", "admin"),
  assignTable,
);

module.exports = router;
