const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

// ─── Admin Schema inline ────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "superadmin" },
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageDrivers: { type: Boolean, default: true },
    manageDestinations: { type: Boolean, default: true },
    manageTransactions: { type: Boolean, default: true },
    manageReviews: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
  phone: String,
  profileImage: String,
  lastLogin: Date,
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if superadmin already exists
    const existing = await Admin.findOne({ email: "superadmin@travelapp.com" });
    if (existing) {
      console.log("⚠️  SuperAdmin already exists!");
      console.log("   Email: superadmin@travelapp.com");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("Admin@123456", salt);

    const superAdmin = new Admin({
      fullName: "Super Admin",
      email: "superadmin@travelapp.com",
      password: hashedPassword,
      role: "superadmin",
      phone: "+1234567890",
      permissions: {
        manageUsers: true,
        manageDrivers: true,
        manageDestinations: true,
        manageTransactions: true,
        manageReviews: true,
      },
    });

    await superAdmin.save();

    console.log("✅ SuperAdmin created successfully!");
    console.log("─────────────────────────────────");
    console.log("   Email:    superadmin@travelapp.com");
    console.log("   Password: Admin@123456");
    console.log("   Role:     superadmin");
    console.log("─────────────────────────────────");
    console.log("⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating SuperAdmin:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();