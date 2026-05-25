const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getUserTransactions,
  updateTransaction,
  cancelTransaction,
  getRevenueSummary,
  uploadReceipt,
} = require("./financeController");
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const { uploadSingle } = require("../../middleware/uploadMiddleware");

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.get("/", adminOnly, getAllTransactions);
router.get("/summary", adminOnly, getRevenueSummary);
router.put(
  "/:id",
  adminOnly,
  uploadSingle("receiptImage"),
  updateTransaction
);

// ─── Protected Routes (Logged in user) ───────────────────────────────────────
router.post("/", protect, createTransaction);
router.get("/user/:userId", protect, getUserTransactions);
router.get("/:id", protect, getTransactionById);
router.delete("/:id", protect, cancelTransaction);

// ─── Receipt Upload (owner or admin) ─────────────────────────────────────────
router.patch(
  "/:id/receipt",
  protect,
  uploadSingle("receiptImage"),
  uploadReceipt
);

module.exports = router;