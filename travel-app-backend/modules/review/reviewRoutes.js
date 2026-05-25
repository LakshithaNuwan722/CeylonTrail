const express = require("express");
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getDriverReviews,
  getDestinationReviews,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  markHelpful,
} = require("./reviewController");
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const { uploadMultiple } = require("../../middleware/uploadMiddleware");

// ─── Public Routes ───────────────────────────────────────────────────────────
router.get("/", getAllReviews);
router.get("/:id", getReviewById);
router.get("/driver/:driverId", getDriverReviews);
router.get("/destination/:destinationId", getDestinationReviews);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.post("/", protect, uploadMultiple("reviewImages", 4), createReview);
router.get("/user/:userId", protect, getUserReviews);
router.put("/:id", protect, uploadMultiple("reviewImages", 4), updateReview);
router.delete("/:id", protect, deleteReview);
router.patch("/:id/helpful", protect, markHelpful);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.patch("/:id/approve", adminOnly, approveReview);

module.exports = router;