const express = require("express");
const {
  createTicket,
  getTickets,
  getMyTickets,
  updateTicketStatus,
} = require("../controllers/maintenanceController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Login required for all routes
router.use(protect);

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

// Create ticket – any operations role that reports an issue
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
