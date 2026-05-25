const express = require("express");
const router = express.Router();
const {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  toggleAvailability,
} = require("./driverController");
const { adminOnly } = require("../../middleware/authMiddleware");
const { uploadFields } = require("../../middleware/uploadMiddleware");

const driverUploadFields = uploadFields([
  { name: "profileImage", maxCount: 1 },
  { name: "licenseImage", maxCount: 1 },
  { name: "vehicleImage", maxCount: 1 },
]);

// ─── Public Routes ───────────────────────────────────────────────────────────
router.get("/", getAllDrivers);
router.get("/:id", getDriverById);

// ─── Admin Only Routes ───────────────────────────────────────────────────────
router.post("/", adminOnly, driverUploadFields, createDriver);
router.put("/:id", adminOnly, driverUploadFields, updateDriver);
router.delete("/:id", adminOnly, deleteDriver);
router.patch("/:id/availability", adminOnly, toggleAvailability);

module.exports = router;