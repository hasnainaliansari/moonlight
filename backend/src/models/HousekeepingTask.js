// src/models/HousekeepingTask.js
const mongoose = require("mongoose");

const housekeepingTaskSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    type: {
      type: String,
      enum: ["cleaning", "inspection", "turndown"],
      default: "cleaning",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },

    // Main description shown in UI
    description: {
      type: String,
      trim: true,
    },

    // Optional extra notes if you ever want
    notes: {
      type: String,
      trim: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // housekeeping staff
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who created the task (manager/receptionist)
      required: true,
    },
  },
  { timestamps: true }
);

const HousekeepingTask = mongoose.model(
  "HousekeepingTask",
  housekeepingTaskSchema
);

module.exports = HousekeepingTask;
