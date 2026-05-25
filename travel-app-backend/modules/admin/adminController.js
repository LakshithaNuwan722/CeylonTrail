const Admin = require("./adminModel");
const User = require("../user/userModel");
const Driver = require("../driver/driverModel");
const Destination = require("../destination/destinationModel");
const Transaction = require("../finance/financeModel");
const Review = require("../review/reviewModel");
const jwt = require("jsonwebtoken");

// ─── Generate JWT Token ──────────────────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ─── @desc    Admin Login
// ─── @route   POST /api/admin/login
// ─── @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your admin account has been deactivated",
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id, admin.role);

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        profileImage: admin.profileImage,
        token,
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

// ─── @desc    Register Admin
// ─── @route   POST /api/admin/register
// ─── @access  SuperAdmin Only
const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, permissions } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    let profileImagePath = null;
    if (req.file) {
      profileImagePath = req.file.path.replace(/\\/g, "/");
    }

    const admin = await Admin.create({
      fullName,
      email,
      password,
      phone,
      role: role || "admin",
      permissions: permissions || {},
      profileImage: profileImagePath,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
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

// ─── @desc    Get Dashboard Stats
// ─── @route   GET /api/admin/dashboard
// ─── @access  Admin Only
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      totalDestinations,
      totalReviews,
      revenueData,
      statusCounts,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Driver.countDocuments(),
      Destination.countDocuments({ isActive: true }),
      Review.countDocuments(),
      Transaction.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$pricing.totalAmount" } } },
      ]),
      Transaction.aggregate([
        { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
      ]),
      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "fullName email")
        .populate("destinationId", "name"),
      User.find().sort({ createdAt: -1 }).limit(5).select("fullName email createdAt"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDrivers,
        totalDestinations,
        totalReviews,
        totalRevenue: revenueData[0]?.total || 0,
        bookingStatusBreakdown: statusCounts,
        recentBookings,
        recentUsers,
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

// ─── @desc    Get All Admins
// ─── @route   GET /api/admin
// ─── @access  SuperAdmin Only
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ─── @desc    Get Single Admin
// ─── @route   GET /api/admin/:id
// ─── @access  Admin Only
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Update Admin
// ─── @route   PUT /api/admin/:id
// ─── @access  Admin Only
const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const { fullName, phone, permissions } = req.body;

    let profileImagePath = admin.profileImage;
    if (req.file) {
      profileImagePath = req.file.path.replace(/\\/g, "/");
    }

    const updated = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        fullName: fullName || admin.fullName,
        phone: phone || admin.phone,
        profileImage: profileImagePath,
        permissions: permissions || admin.permissions,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Delete Admin
// ─── @route   DELETE /api/admin/:id
// ─── @access  SuperAdmin Only
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── @desc    Toggle Admin Status
// ─── @route   PATCH /api/admin/:id/status
// ─── @access  SuperAdmin Only
const toggleAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin account ${admin.isActive ? "activated" : "deactivated"}`,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  adminLogin,
  registerAdmin,
  getDashboardStats,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
};