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

router.use(protect);

// My tasks – housekeeping staff / manager / admin
router.get(
  "/my-tasks",
  requireRole("housekeeping", "manager", "admin"),
  getMyTasks
);

// ✅ tasks list – housekeeping/manager/admin
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

// Update status – housekeeping/manager/admin (old)
router.patch(
  "/tasks/:id/status",
  requireRole("housekeeping", "manager", "admin"),
  updateTaskStatus
);

// ✅ Update status – housekeeping/manager/admin (new - brief)
router.patch(
  "/tasks/:id",
  requireRole("housekeeping", "manager", "admin"),
  updateTaskStatus
);

module.exports = router;
