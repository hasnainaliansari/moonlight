// src/routes/profileRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} = require("../controllers/profileController");

const router = express.Router();

// Login required for all profile routes
router.use(protect);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.post("/change-password", changeMyPassword);

module.exports = router;
