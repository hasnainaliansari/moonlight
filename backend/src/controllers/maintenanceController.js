// src/controllers/maintenanceController.js
const mongoose = require("mongoose");
const Maintenance = require("../models/Maintenance");
const Room = require("../models/Room");

// POST /api/maintenance/tickets
// Create maintenance ticket
const createTicket = async (req, res) => {
  try {
    const { roomId, issue, priority, reportedDate, notes, assignedTo } =
      req.body;

    if (!roomId || !issue) {
      return res
        .status(400)
        .json({ message: "roomId and issue are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validate assignedTo if provided (same pattern as housekeeping)
    if (
      assignedTo &&
      typeof assignedTo === "string" &&
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid maintenance staff id" });
    }

    // reportedDate optional – default: today (midnight)
    let reported = reportedDate ? new Date(reportedDate) : new Date();
    reported.setHours(0, 0, 0, 0);

    const ticket = await Maintenance.create({
      room: room._id,
      issue: issue.trim(),
      priority: priority || "normal",
      status: "open",
      reportedDate: reported,
      notes: notes || "",
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
    });

    // Populate so frontend ko turant naam / room number mil jaye
    await ticket.populate("room", "roomNumber type status");
    await ticket.populate("assignedTo", "name email role");
    await ticket.populate("createdBy", "name email role");

    res.status(201).json({
      message: "Maintenance ticket created",
      ticket,
    });
  } catch (error) {
    console.error("Create maintenance ticket error:", error);
    console.error("Request body:", req.body);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/maintenance/tickets
const getTickets = async (req, res) => {
  try {
    const tickets = await Maintenance.find()
      .populate("room", "roomNumber type status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ reportedDate: -1, createdAt: -1 });

    res.json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get maintenance tickets error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/maintenance/my-tickets
// For maintenance staff – only their tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Maintenance.find({ assignedTo: req.user.id })
      .populate("room", "roomNumber type status")
      .sort({ reportedDate: -1, createdAt: -1 });

    res.json({
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get my maintenance tickets error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/maintenance/tickets/:id/status
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["open", "in_progress", "resolved"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const ticket = await Maintenance.findById(req.params.id).populate("room");
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = status;

    if (status === "resolved") {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    res.json({
      message: "Maintenance ticket updated",
      ticket,
    });
  } catch (error) {
    console.error("Update maintenance status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getMyTickets,
  updateTicketStatus,
};
