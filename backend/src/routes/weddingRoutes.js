const express = require("express");
const { body } = require("express-validator");
const {
  createWedding,
  getAllWeddings,
  getMyWeddings,
  getWedding,
  updateWedding,
  deleteWedding,
  assignPlanner,
  removePlanner,
  updateWeddingStatus,
} = require("../controllers/weddingController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Validation rules
const createWeddingValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Wedding title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("weddingDate")
    .notEmpty()
    .withMessage("Wedding date is required")
    .isISO8601()
    .withMessage("Please provide a valid date"),
  body("venue.name").trim().notEmpty().withMessage("Venue name is required"),
  body("venue.address.city").trim().notEmpty().withMessage("City is required"),
  body("venue.address.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
];

// Routes
router
  .route("/")
  .post(
    protect,
    authorize("couple"),
    createWeddingValidation,
    validate,
    createWedding,
  )
  .get(protect, authorize("admin", "planner"), getAllWeddings);

router.get("/my-weddings", protect, authorize("couple"), getMyWeddings);

router
  .route("/:id")
  .get(protect, getWedding)
  .put(protect, updateWedding)
  .delete(protect, deleteWedding);

router.put(
  "/:id/assign-planner",
  protect,
  authorize("couple", "admin"),
  assignPlanner,
);

router.put(
  "/:id/remove-planner",
  protect,
  authorize("couple", "admin"),
  removePlanner,
);

router.put("/:id/status", protect, updateWeddingStatus);

module.exports = router;
