// src/routes/reportRoutes.js
const express = require("express");
const {
  getSummary,
  getRevenueByDateRange,
} = require("../controllers/reportController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Reports are for management/admin
router.use(protect, requireRole("admin", "manager"));

// Dashboard summary
router.get("/summary", getSummary);

// Revenue chart data
router.get("/revenue", getRevenueByDateRange);

module.exports = router;
