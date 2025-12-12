// src/models/Guest.js
const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    preferences: {
      type: String, // e.g. "High floor, non-smoking"
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isVIP: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // staff member who created this guest
    },
  },
  { timestamps: true }
);

// (optional but useful) fast lookup by email
guestSchema.index({ email: 1 });

const Guest = mongoose.model("Guest", guestSchema);

module.exports = Guest;
