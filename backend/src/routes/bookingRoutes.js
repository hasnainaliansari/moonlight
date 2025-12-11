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

// List and detail
router.get("/", getBookings);        // GET /api/bookings
router.get("/:id", getBookingById);  // GET /api/bookings/:id
router.get("/my", getMyBookings);    // GET /api/bookings/my  (guest)

// Guest self-service booking
router.post("/self", createSelfBooking);

// Create and manage bookings – admin/manager/receptionist
router.post(
  "/",
  requireRole("admin", "manager", "receptionist"),
  createBooking
);

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


// Create and manage bookings – admin/manager/receptionist
router.post(
  "/",
  requireRole("admin", "manager", "receptionist"),
  createBooking
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

module.exports = router;
