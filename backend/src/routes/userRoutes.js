// src/routes/userRoutes.js
const express = require("express");
const {
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  updateStaffStatus,
} = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// All /api/users routes = protected + admin-only
router.use(protect, requireRole("admin"));

router.get("/", getStaffUsers);                 // GET /api/users
router.post("/", createStaffUser);              // POST /api/users
router.patch("/:id", updateStaffUser);          // PATCH /api/users/:id
router.patch("/:id/status", updateStaffStatus); // PATCH /api/users/:id/status

module.exports = router;
