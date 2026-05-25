const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
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
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Transaction ID is required"],
      unique: true,
    },
    ratings: {
      overallRating: {
        type: Number,
        required: [true, "Overall rating is required"],
        min: 1,
        max: 5,
      },
      driverRating: { type: Number, min: 1, max: 5 },
      destinationRating: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
    },
    reviewTitle: {
      type: String,
      trim: true,
    },
    reviewText: {
      type: String,
      required: [true, "Review text is required"],
      minlength: [10, "Review must be at least 10 characters"],
    },
    reviewImages: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    adminNote: {
      type: String,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);