// src/routes/housekeepingRoutes.js
const express = require("express");
const {
  createTask,
  getTasks,
  getMyTasks,
  updateTaskStatus,
} = require("../controllers/housekeepingController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// All housekeeping routes require login
router.use(protect);

// My tasks – housekeeping staff / manager / admin
router.get(
  "/my-tasks",
  requireRole("housekeeping", "manager", "admin"),
  getMyTasks
);

// All tasks – manager/admin/housekeeping
router.get(
  "/tasks",
  requireRole("housekeeping", "manager", "admin"),
  getTasks
);

// Create task – admin/manager/receptionist
router.post(
  "/tasks",
  requireRole("admin", "manager", "receptionist"),
  createTask
);

// Update status – housekeeping/manager/admin
router.patch(
  "/tasks/:id/status",
  requireRole("housekeeping", "manager", "admin"),
  updateTaskStatus
);

module.exports = router;
