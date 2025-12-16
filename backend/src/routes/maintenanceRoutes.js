// src/routes/maintenanceRoutes.js
const express = require("express");
const {
  createTicket,
  createRequest,
  getTickets,
  getMyTickets,
  updateTicketStatus,
} = require("../controllers/maintenanceController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// ✅ Guest request
router.post(
  "/requests",
  requireRole("guest"),
  createRequest
);

// My tickets – maintenance / manager / admin
router.get(
  "/my-tickets",
  requireRole("maintenance", "manager", "admin"),
  getMyTickets
);

// All tickets – maintenance / manager / admin
router.get(
  "/tickets",
  requireRole("maintenance", "manager", "admin"),
  getTickets
);

// Create ticket – ops roles (staff)
router.post(
  "/tickets",
  requireRole("admin", "manager", "receptionist", "housekeeping"),
  createTicket
);

// Update status – maintenance / manager / admin
router.patch(
  "/tickets/:id/status",
  requireRole("maintenance", "manager", "admin"),
  updateTicketStatus
);

module.exports = router;
