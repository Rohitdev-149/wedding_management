const express = require("express");
const {
  getAllVendors,
  getVendor,
  uploadVendorImages,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/multer");

const router = express.Router();

// Public routes
router.get("/vendors", getAllVendors);
router.get("/vendors/:id", getVendor);

// Protected: vendor owner or admin can upload images
router.post(
  "/vendors/:id/images",
  protect,
  authorize("vendor", "admin"),
  upload.array("images", 200),
  uploadVendorImages,
);

module.exports = router;
