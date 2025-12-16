// src/routes/bookingRoutes.js
const express = require("express");
const {
  createBooking,
  createSelfBooking,
  getBookings,
  getBookingById,
  checkInBooking,
  checkOutBooking,
  confirmBooking,
  getMyBookings,
} = require("../controllers/bookingController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// All booking routes require login
router.use(protect);

// ✅ Put static routes BEFORE dynamic "/:id"
router.get("/my", getMyBookings); // GET /api/bookings/my  (guest)
router.post("/self", createSelfBooking); // Guest self-service booking

// List
router.get("/", getBookings); // GET /api/bookings

// Create and manage bookings – admin/manager/receptionist
router.post("/", requireRole("admin", "manager", "receptionist"), createBooking);

router.patch(
  "/:id/confirm",
  requireRole("admin", "manager", "receptionist"),
  confirmBooking
);

router.patch(
  "/:id/checkin",
  requireRole("admin", "manager", "receptionist"),
  checkInBooking
);

router.patch(
  "/:id/checkout",
  requireRole("admin", "manager", "receptionist"),
  checkOutBooking
);

// Detail (keep at bottom so it doesn't catch /my)
router.get("/:id", getBookingById); // GET /api/bookings/:id

module.exports = router;
