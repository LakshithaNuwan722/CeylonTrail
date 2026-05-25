const jwt = require("jsonwebtoken");
const User = require("../modules/user/userModel");
const Admin = require("../modules/admin/adminModel");

// ─── Protect User Routes ────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a user or admin token
    if (decoded.role === "admin" || decoded.role === "superadmin") {
      req.admin = await Admin.findById(decoded.id).select("-password");
      req.user = req.admin;
    } else {
      req.user = await User.findById(decoded.id).select("-password");
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid. User not found.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired.",
    });
  }
};

// ─── Admin Only Access ──────────────────────────────────────────────────────
const adminOnly = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found.",
      });
    }

    req.user = req.admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired.",
    });
  }
};

// ─── Super Admin Only ───────────────────────────────────────────────────────
const superAdminOnly = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super Admin privileges required.",
      });
    }

    req.admin = await Admin.findById(decoded.id).select("-password");
    req.user = req.admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired.",
    });
  }
};

module.exports = { protect, adminOnly, superAdminOnly };