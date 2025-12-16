// src/models/Maintenance.js
const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    // ✅ optional link to booking (guest can select current booking)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    issue: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },

    reportedDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    // ✅ optional photo (string URL). You can later wire uploadMiddleware.
    photoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // existing staff creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ NEW: if created by guest, store here as well (still keep createdBy required)
    createdByGuest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

module.exports = Maintenance;
