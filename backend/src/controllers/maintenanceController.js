// src/controllers/maintenanceController.js
const mongoose = require("mongoose");
const Maintenance = require("../models/Maintenance");
const Room = require("../models/Room");

// POST /api/maintenance/tickets
// Staff create ticket
const createTicket = async (req, res) => {
  try {
    const { roomId, issue, priority, reportedDate, notes, assignedTo, bookingId, photoUrl } =
      req.body;

    if (!roomId || !issue) {
      return res.status(400).json({ message: "roomId and issue are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (
      assignedTo &&
      typeof assignedTo === "string" &&
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res.status(400).json({ message: "Invalid maintenance staff id" });
    }

    if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    let reported = reportedDate ? new Date(reportedDate) : new Date();
    reported.setHours(0, 0, 0, 0);

    const ticket = await Maintenance.create({
      room: room._id,
      booking: bookingId || null,
      issue: issue.trim(),
      priority: priority || "normal",
      status: "open",
      reportedDate: reported,
      notes: notes || "",
      photoUrl: photoUrl || "",
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
      createdByGuest: null,
    });

    await ticket.populate("room", "roomNumber type status");
    await ticket.populate("assignedTo", "name email role");
    await ticket.populate("createdBy", "name email role");

    res.status(201).json({ message: "Maintenance ticket created", ticket });
  } catch (error) {
    console.error("Create maintenance ticket error:", error);
    console.error("Request body:", req.body);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ POST /api/maintenance/requests
// Guest create request
const createRequest = async (req, res) => {
  try {
    const { roomId, bookingId, issue, notes, priority, photoUrl } = req.body;

    if (!roomId || !issue) {
      return res.status(400).json({ message: "roomId and issue are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const reported = new Date();
    reported.setHours(0, 0, 0, 0);

    const ticket = await Maintenance.create({
      room: room._id,
      booking: bookingId || null,
      issue: issue.trim(),
      priority: priority || "normal",
      status: "open",
      reportedDate: reported,
      notes: notes || "",
      photoUrl: photoUrl || "",
      assignedTo: null,
      createdBy: req.user.id,       // keep required field satisfied
      createdByGuest: req.user.id,  // ✅ guest marker
    });

    await ticket.populate("room", "roomNumber type status");

    res.status(201).json({
      message: "Maintenance request submitted",
      ticket,
    });
  } catch (error) {
    console.error("Create maintenance request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/maintenance/tickets
const getTickets = async (req, res) => {
  try {
    let filter = {};

    // ✅ maintenance staff: show their assigned OR open & unassigned (so they can pick)
    if (req.user?.role === "maintenance") {
      filter = {
        $or: [
          { assignedTo: req.user.id },
          { assignedTo: null, status: "open" },
        ],
      };
    }

    const tickets = await Maintenance.find(filter)
      .populate("room", "roomNumber type status")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ reportedDate: -1, createdAt: -1 });

    res.json({ count: tickets.length, tickets });
  } catch (error) {
    console.error("Get maintenance tickets error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/maintenance/my-tickets (keep for backward compat)
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Maintenance.find({ assignedTo: req.user.id })
      .populate("room", "roomNumber type status")
      .sort({ reportedDate: -1, createdAt: -1 });

    res.json({ count: tickets.length, tickets });
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
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // ✅ maintenance can only update:
    // - their assigned ticket
    // - OR claim unassigned when moving to in_progress
    if (req.user?.role === "maintenance") {
      const assignedId = ticket.assignedTo?.toString() || null;
      const me = String(req.user.id);

      if (assignedId && assignedId !== me) {
        return res.status(403).json({ message: "You can only update your assigned tickets." });
      }

      if (!assignedId && status === "in_progress") {
        ticket.assignedTo = req.user.id; // claim
      }
    }

    ticket.status = status;

    if (status === "resolved") {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    await ticket.populate("room", "roomNumber type status");
    await ticket.populate("assignedTo", "name email role");
    await ticket.populate("createdBy", "name email role");

    res.json({ message: "Maintenance ticket updated", ticket });
  } catch (error) {
    console.error("Update maintenance status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTicket,
  createRequest, // ✅ NEW
  getTickets,
  getMyTickets,
  updateTicketStatus,
};
