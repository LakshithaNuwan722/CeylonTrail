const Transaction = require("./financeModel");
const Driver = require("../driver/driverModel");

// ─── @desc    Create New Booking/Transaction
// ─── @route   POST /api/transactions
// ─── @access  Protected
const createTransaction = async (req, res) => {
  try {
    const {
      driverId,
      destinationId,
      startDate,
      endDate,
      pickupLocation,
      paymentMethod,
      notes,
    } = req.body;

    if (!driverId || !destinationId || !startDate || !endDate || !pickupLocation || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Get driver price per day
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (!driver.availability) {
      return res.status(400).json({
        success: false,
        message: "Driver is not available",
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      driverId,
      destinationId,
      tripDetails: {
        startDate,
        endDate,
        pickupLocation,
      },
      pricing: {
        pricePerDay: driver.vehicle.pricePerDay,
      },
      paymentMethod,
      notes,
    });

    const populated = await Transaction.findById(transaction._id)
      .populate("userId", "fullName email")
      .populate("driverId", "fullName vehicle")
      .populate("destinationId", "name location");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get All Transactions
// ─── @route   GET /api/transactions
// ─── @access  Admin Only
const getAllTransactions = async (req, res) => {
  try {
    const { paymentStatus, bookingStatus, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (bookingStatus) filter.bookingStatus = bookingStatus;

    const skip = (page - 1) * limit;
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("userId", "fullName email")
      .populate("driverId", "fullName vehicle")
      .populate("destinationId", "name location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get Single Transaction
// ─── @route   GET /api/transactions/:id
// ─── @access  Protected
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("userId", "fullName email phone")
      .populate("driverId", "fullName phone vehicle")
      .populate("destinationId", "name location images");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get User Transactions
// ─── @route   GET /api/transactions/user/:userId
// ─── @access  Protected
const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .populate("driverId", "fullName vehicle")
      .populate("destinationId", "name location images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Update Transaction Status
// ─── @route   PUT /api/transactions/:id
// ─── @access  Admin Only
const updateTransaction = async (req, res) => {
  try {
    const { paymentStatus, bookingStatus, notes } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    let receiptImagePath = transaction.receiptImage;
    if (req.file) {
      receiptImagePath = req.file.path.replace(/\\/g, "/");
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: paymentStatus || transaction.paymentStatus,
        bookingStatus: bookingStatus || transaction.bookingStatus,
        notes: notes || transaction.notes,
        receiptImage: receiptImagePath,
      },
      { new: true }
    )
      .populate("userId", "fullName email")
      .populate("driverId", "fullName vehicle")
      .populate("destinationId", "name location");

    // Update driver total trips if completed
    if (bookingStatus === "completed") {
      await Driver.findByIdAndUpdate(transaction.driverId, {
        $inc: { totalTrips: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Cancel Transaction
// ─── @route   DELETE /api/transactions/:id
// ─── @access  Protected
const cancelTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.bookingStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled",
      });
    }

    transaction.bookingStatus = "cancelled";
    transaction.paymentStatus = "cancelled";
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get Revenue Summary
// ─── @route   GET /api/transactions/summary
// ─── @access  Admin Only
const getRevenueSummary = async (req, res) => {
  try {
    const totalRevenue = await Transaction.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$pricing.totalAmount" } } },
    ]);

    const statusCounts = await Transaction.aggregate([
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName")
      .populate("destinationId", "name");

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: statusCounts,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// ─── @desc    Upload Receipt Image
// ─── @route   PATCH /api/transactions/:id/receipt
// ─── @access  Protected (owner or admin)
const uploadReceipt = async (req, res) => {
  try {
    // ─── Find transaction ──────────────────────────────────────────────────
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ─── Check ownership (user must own this transaction or be admin) ──────
    const isOwner =
      transaction.userId.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === "admin" || req.user.role === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this transaction",
      });
    }

    // ─── Check if file was uploaded ────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
    }

    // ─── Check transaction is not cancelled ────────────────────────────────
    if (transaction.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot upload receipt for a cancelled booking",
      });
    }

    // ─── Save receipt image path ───────────────────────────────────────────
    const receiptImagePath = req.file.path.replace(/\\/g, "/");

    // ─── Update transaction ────────────────────────────────────────────────
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        receiptImage: receiptImagePath,
      },
      { new: true }
    )
      .populate("userId", "fullName email")
      .populate("driverId", "fullName vehicle")
      .populate("destinationId", "name location");

    res.status(200).json({
      success: true,
      message: "Receipt uploaded successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while uploading receipt",
      error: error.message,
    });
  }
};
module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getUserTransactions,
  updateTransaction,
  cancelTransaction,
  getRevenueSummary,
  uploadReceipt,
};