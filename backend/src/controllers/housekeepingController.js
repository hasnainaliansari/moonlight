// src/controllers/housekeepingController.js
const mongoose = require("mongoose");
const HousekeepingTask = require("../models/HousekeepingTask");
const Room = require("../models/Room");

// POST /api/housekeeping/tasks
// Create a housekeeping task (admin/manager/receptionist)
const createTask = async (req, res) => {
  try {
    const { roomId, type, scheduledDate, description, assignedTo } = req.body;

    // Basic required fields
    if (!roomId || !description) {
      return res
        .status(400)
        .json({ message: "roomId and description are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validate assignedTo if provided
    if (
      assignedTo &&
      typeof assignedTo === "string" &&
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res.status(400).json({ message: "Invalid housekeeping staff id" });
    }

    // scheduledDate optional – default: today
    let scheduled = scheduledDate ? new Date(scheduledDate) : new Date();
    scheduled.setHours(0, 0, 0, 0);

    const task = await HousekeepingTask.create({
      room: room._id,
      type: type || "cleaning",
      scheduledDate: scheduled,
      description,
      status: "pending",
      createdBy: req.user.id,
      assignedTo: assignedTo || null, // saving directly here
    });

    // Optional: when cleaning task is created, mark room as "cleaning"
    if (task.type === "cleaning" && room.status !== "cleaning") {
      room.status = "cleaning";
      await room.save();
    }

    // Populate so the frontend can immediately get the names
    await task.populate("room", "roomNumber type status");
    await task.populate("assignedTo", "name email role");
    await task.populate("createdBy", "name email role");

    res.status(201).json({
      message: "Housekeeping task created",
      task,
    });
  } catch (error) {
    console.error("Create housekeeping task error:", error);
    console.error("Request body:", req.body);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/housekeeping/tasks
// List all tasks (for manager/admin/housekeeping)
const getTasks = async (req, res) => {
  try {
    const tasks = await HousekeepingTask.find()
      .populate("room", "roomNumber type status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get housekeeping tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/housekeeping/my-tasks
// For housekeeping staff: only their own tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await HousekeepingTask.find({ assignedTo: req.user.id })
      .populate("room", "roomNumber type status")
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get my housekeeping tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/housekeeping/tasks/:id/status
// Update status (housekeeping / manager / admin)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "in_progress", "done"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const task = await HousekeepingTask.findById(req.params.id).populate(
      "room"
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;

    if (status === "done") {
      task.completedAt = new Date();

      // If room was "cleaning" → mark as available
      if (task.room && task.room.status === "cleaning") {
        task.room.status = "available";
        await task.room.save();
      }
    }

    await task.save();

    res.json({
      message: "Housekeeping task updated",
      task,
    });
  } catch (error) {
    console.error("Update housekeeping task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  updateTaskStatus,
};
