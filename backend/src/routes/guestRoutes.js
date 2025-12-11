// src/routes/guestRoutes.js
const express = require("express");
const {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  getGuestBookings,
} = require("../controllers/guestController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// saare guest APIs: login required
router.use(protect);

// Guest management: admin / manager / receptionist
router.use(requireRole("admin", "manager", "receptionist"));

router.get("/", getGuests);                // GET /api/guests
router.post("/", createGuest);             // POST /api/guests
router.get("/:id", getGuestById);          // GET /api/guests/:id
router.patch("/:id", updateGuest);         // PATCH /api/guests/:id
router.get("/:id/bookings", getGuestBookings); // GET /api/guests/:id/bookings

module.exports = router;
