const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      default: () => "TXN-" + uuidv4().split("-")[0].toUpperCase(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Driver ID is required"],
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Destination ID is required"],
    },
    tripDetails: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      numberOfDays: { type: Number },
      pickupLocation: { type: String, required: true },
    },
    pricing: {
      pricePerDay: { type: Number, required: true },
      subtotal: { type: Number },
      tax: { type: Number, default: 0 },
      totalAmount: { type: Number },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "online"],
      required: [true, "Payment method is required"],
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    receiptImage: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Auto calculate pricing before save ─────────────────────────────────────
transactionSchema.pre("save", function (next) {
  if (this.tripDetails.startDate && this.tripDetails.endDate) {
    const start = new Date(this.tripDetails.startDate);
    const end = new Date(this.tripDetails.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.tripDetails.numberOfDays = diffDays || 1;
  }

  if (this.pricing.pricePerDay && this.tripDetails.numberOfDays) {
    this.pricing.subtotal =
      this.pricing.pricePerDay * this.tripDetails.numberOfDays;
    this.pricing.tax = parseFloat((this.pricing.subtotal * 0.1).toFixed(2));
    this.pricing.totalAmount = parseFloat(
      (this.pricing.subtotal + this.pricing.tax).toFixed(2)
    );
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);