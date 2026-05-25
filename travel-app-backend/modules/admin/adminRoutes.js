const express = require("express");
const router = express.Router();
const {
  adminLogin,
  registerAdmin,
  getDashboardStats,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
} = require("./adminController");
const { adminOnly, superAdminOnly } = require("../../middleware/authMiddleware");
const { uploadSingle } = require("../../middleware/uploadMiddleware");

// ─── Public Routes ───────────────────────────────────────────────────────────
router.post("/login", adminLogin);

// ─── Admin Protected Routes ──────────────────────────────────────────────────
router.get("/dashboard", adminOnly, getDashboardStats);
router.get("/:id", adminOnly, getAdminById);
router.put("/:id", adminOnly, uploadSingle("profileImage"), updateAdmin);

// ─── SuperAdmin Only Routes ──────────────────────────────────────────────────
router.post("/register", superAdminOnly, uploadSingle("profileImage"), registerAdmin);
router.get("/", superAdminOnly, getAllAdmins);
router.delete("/:id", superAdminOnly, deleteAdmin);
router.patch("/:id/status", superAdminOnly, toggleAdminStatus);

module.exports = router;