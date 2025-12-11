// src/routes/roomRoutes.js
const express = require("express");
const {
  getRooms,
  createRoom,
  updateRoom,
  updateRoomImageOnly,
  updateRoomStatus,
  getAvailableRooms,
  getPublicRooms,
  getPublicRoomById,
  getPublicRoomBookings,
} = require("../controllers/roomController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { uploadRoomImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

/**
 * PUBLIC guest-facing routes (no auth)
 */
router.get("/public", getPublicRooms);
router.get("/public/:id", getPublicRoomById);
router.get("/public/:id/bookings", getPublicRoomBookings);

/**
 * STAFF routes – everything below requires auth
 */
router.use(protect);

// List all rooms – all staff can see
router.get(
  "/",
  requireRole(
    "admin",
    "manager",
    "receptionist",
    "housekeeping",
    "maintenance"
  ),
  getRooms
);

// Get rooms available in a date range – for bookings
router.get(
  "/available",
  requireRole("admin", "manager", "receptionist"),
  getAvailableRooms
);

// Create room – admin/manager only, supports multiple images
router.post(
  "/",
  requireRole("admin", "manager"),
  uploadRoomImage.fields([
    { name: "roomImage", maxCount: 1 }, // main
    { name: "bathroomImage", maxCount: 1 },
    { name: "livingImage", maxCount: 1 },
    { name: "kitchenImage", maxCount: 1 },
  ]),
  createRoom
);

// Update room details – admin/manager only (no files, JSON)
router.patch("/:id", requireRole("admin", "manager"), updateRoom);

// Update a single image slot – admin/manager only
// Example: PATCH /api/rooms/:id/image?slot=bathroom
router.patch(
  "/:id/image",
  requireRole("admin", "manager"),
  uploadRoomImage.single("roomImage"),
  updateRoomImageOnly
);

// Update room status – admin/manager only
router.patch("/:id/status", requireRole("admin", "manager"), updateRoomStatus);

module.exports = router;
