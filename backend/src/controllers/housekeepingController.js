// src/controllers/housekeepingController.js
const mongoose = require("mongoose");
const HousekeepingTask = require("../models/HousekeepingTask");
const Room = require("../models/Room");

// POST /api/housekeeping/tasks
// Create a housekeeping task (admin/manager/receptionist)
const createTask = async (req, res) => {
  try {
    const { roomId, type, scheduledDate, description, assignedTo } = req.body;

    if (!roomId || !description) {
      return res
        .status(400)
        .json({ message: "roomId and description are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (
      assignedTo &&
      typeof assignedTo === "string" &&
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res.status(400).json({ message: "Invalid housekeeping staff id" });
    }

    let scheduled = scheduledDate ? new Date(scheduledDate) : new Date();
    scheduled.setHours(0, 0, 0, 0);

    const task = await HousekeepingTask.create({
      room: room._id,
      type: type || "cleaning",
      scheduledDate: scheduled,
      description,
      status: "pending",
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
    });

    // Optional: task create pe room "cleaning" set (agar tum already use kar rahe ho)
    if (task.type === "cleaning" && room.status !== "cleaning") {
      room.status = "cleaning";
      await room.save();
    }

    await task.populate("room", "roomNumber type status");
    await task.populate("assignedTo", "name email role");
    await task.populate("createdBy", "name email role");

    res.status(201).json({ message: "Housekeeping task created", task });
  } catch (error) {
    console.error("Create housekeeping task error:", error);
    console.error("Request body:", req.body);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/housekeeping/tasks
// ✅ For housekeeping: only assigned tasks
// ✅ For admin/manager: all tasks
const getTasks = async (req, res) => {
  try {
    const filter = {};

    if (req.user?.role === "housekeeping") {
      filter.assignedTo = req.user.id;
    }

    const tasks = await HousekeepingTask.find(filter)
      .populate("room", "roomNumber type status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.json({ count: tasks.length, tasks });
  } catch (error) {
    console.error("Get housekeeping tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/housekeeping/my-tasks (optional, still supported)
const getMyTasks = async (req, res) => {
  try {
    const tasks = await HousekeepingTask.find({ assignedTo: req.user.id })
      .populate("room", "roomNumber type status")
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.json({ count: tasks.length, tasks });
  } catch (error) {
    console.error("Get my housekeeping tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/housekeeping/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    let { status } = req.body;

    // allow "completed" as alias
    if (status === "completed") status = "done";

    const allowed = ["pending", "in_progress", "done"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowed.join(", ")} (or "completed")`,
      });
    }

    const task = await HousekeepingTask.findById(req.params.id).populate("room");
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ Security: housekeeping can update ONLY their own assigned tasks
    if (req.user?.role === "housekeeping") {
      const assignedId = task.assignedTo ? String(task.assignedTo) : "";
      if (!assignedId || assignedId !== String(req.user.id)) {
        return res.status(403).json({
          message: "Access denied. You can update only your assigned tasks.",
        });
      }
    }

    task.status = status;

    // If started, optionally mark room as cleaning
    if (status === "in_progress" && task.type === "cleaning" && task.room) {
      if (task.room.status !== "cleaning") {
        task.room.status = "cleaning";
        await task.room.save();
      }
    }

    if (status === "done") {
      task.completedAt = new Date();

      // ✅ Fix: Done pe room available kar do (cleaning task)
      // (avoid overriding occupied/maintenance if you use those states)
      if (task.type === "cleaning" && task.room) {
        const current = task.room.status;

        if (current !== "occupied" && current !== "maintenance") {
          task.room.status = "available";
          await task.room.save();
        }
      }
    }

    await task.save();

    res.json({ message: "Housekeeping task updated", task });
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
