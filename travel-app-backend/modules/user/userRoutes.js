const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
} = require("./userController");
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const { uploadSingle } = require("../../middleware/uploadMiddleware");

// ─── Auth Routes ─────────────────────────────────────────────────────────────
router.post("/register", uploadSingle("profileImage"), registerUser);
router.post("/login", loginUser);

// ─── User Profile Routes ─────────────────────────────────────────────────────
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, uploadSingle("profileImage"), updateUserProfile);
router.delete("/:id", protect, deleteUser);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/", adminOnly, getAllUsers);

module.exports = router;