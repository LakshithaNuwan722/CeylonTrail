const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Driver full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
    },
    licenseImage: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    vehicle: {
      vehicleType: {
        type: String,
        enum: ["car", "van", "bus", "SUV", "minivan"],
        required: [true, "Vehicle type is required"],
      },
      vehicleName: { type: String, required: true },
      vehicleModel: { type: String },
      plateNumber: { type: String, required: true },
      vehicleImage: { type: String, default: null },
      capacity: { type: Number, required: true },
      pricePerDay: { type: Number, required: true },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Driver", driverSchema);