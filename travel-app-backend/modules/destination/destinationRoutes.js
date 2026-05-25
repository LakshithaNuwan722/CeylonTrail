const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require("./destinationController");
const { adminOnly } = require("../../middleware/authMiddleware");
const { uploadMultiple } = require("../../middleware/uploadMiddleware");

// ─── Public Routes ───────────────────────────────────────────────────────────
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);

// ─── Admin Only Routes ───────────────────────────────────────────────────────
router.post("/", adminOnly, uploadMultiple("images", 5), createDestination);
router.put("/:id", adminOnly, uploadMultiple("images", 5), updateDestination);
router.delete("/:id", adminOnly, deleteDestination);

module.exports = router;