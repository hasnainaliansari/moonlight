// src/routes/invoiceRoutes.js
const express = require("express");
const {
  createInvoiceFromBooking,
  getInvoices,
  getInvoiceById,
  getInvoiceCandidates,
  markInvoicePaid,
  downloadInvoicePdf,
} = require("../controllers/invoiceController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// all invoice routes require login
router.use(protect);

// List all invoices
router.get(
  "/",
  requireRole("admin", "manager", "receptionist"),
  getInvoices
);

// Bookings that do NOT yet have invoices
// NOTE: this MUST come before "/:id" route
router.get(
  "/candidates",
  requireRole("admin", "manager", "receptionist"),
  getInvoiceCandidates
);

// Create invoice from booking
router.post(
  "/from-booking/:bookingId",
  requireRole("admin", "manager", "receptionist"),
  createInvoiceFromBooking
);

// Download / view invoice PDF
// NOTE: this MUST be before "/:id" as well
router.get(
  "/:id/pdf",
  requireRole("admin", "manager", "receptionist"),
  downloadInvoicePdf
);

// Mark invoice as paid
router.patch(
  "/:id/pay",
  requireRole("admin", "manager", "receptionist"),
  markInvoicePaid
);

// Get single invoice detail (JSON)
router.get(
  "/:id",
  requireRole("admin", "manager", "receptionist"),
  getInvoiceById
);

module.exports = router;
