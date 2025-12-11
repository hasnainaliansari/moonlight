const express = require("express");
const {
  createTicket,
  getTickets,
  getMyTickets,
  updateTicketStatus,
} = require("../controllers/maintenanceController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// saare routes pe login required
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

// Create ticket – koi bhi ops role jo issue report karega
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
