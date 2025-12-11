// backend/src/routes/settingRoutes.js
const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// All settings routes require login
router.use(protect);

// GET settings – admin + manager (you can include others if you want)
router.get("/", requireRole("admin", "manager"), getSettings);

// Update settings – admin only (recommended)
router.put("/", requireRole("admin"), updateSettings);

module.exports = router;
