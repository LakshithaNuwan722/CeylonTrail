const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    category: {
      type: String,
      enum: ["beach", "mountain", "city", "cultural", "adventure", "wildlife"],
      required: [true, "Category is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    entryFee: {
      type: Number,
      default: 0,
    },
    bestTimeToVisit: {
      type: String,
    },
    climate: {
      type: String,
    },
    popularAttractions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Destination", destinationSchema);