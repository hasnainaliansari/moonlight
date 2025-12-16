// src/models/Room.js
const mongoose = require("mongoose");

const roomImageSchema = new mongoose.Schema(
  {
    slot: {
      type: String,
      enum: ["main", "bathroom", "living", "kitchen", "other"],
      default: "other",
    },
    url: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["single", "double", "suite", "family"],
      required: true,
    },
    floor: {
      type: Number,
      default: 1,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      // ✅ Added: needs_cleaning (P1.2)
      // Keeping existing values for backward compatibility
      enum: ["available", "occupied", "needs_cleaning", "cleaning", "maintenance"],
      default: "available",
    },

    capacity: {
      type: Number,
      default: 2,
    },
    features: [
      {
        type: String,
        // e.g. "sea_view", "balcony", "wifi", "breakfast_included"
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    // Backward-compatible main image URL
    imageUrl: {
      type: String,
      trim: true,
    },
    // New: gallery images with specific slots
    images: [roomImageSchema],
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
