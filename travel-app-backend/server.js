const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ─── Route Imports ───────────────────────────────────────────────────────────
const userRoutes = require("./modules/user/userRoutes");
const destinationRoutes = require("./modules/destination/destinationRoutes");
const driverRoutes = require("./modules/driver/driverRoutes");
const financeRoutes = require("./modules/finance/financeRoutes");
const adminRoutes = require("./modules/admin/adminRoutes");
const reviewRoutes = require("./modules/review/reviewRoutes");

// ─── Connect Database ────────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Static Files ────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Travel App API is Live!",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      destinations: "/api/destinations",
      drivers: "/api/drivers",
      transactions: "/api/transactions",
      admin: "/api/admin",
      reviews: "/api/reviews",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/transactions", financeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

// ─── Error Middleware ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;