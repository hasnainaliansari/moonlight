// src/routes/authRoutes.js
const express = require("express");
const {
  register,
  login,
  oauthLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Email/password auth
router.post("/register", register);
router.post("/login", login);

// Forgot password + reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Social OAuth (Google / Facebook / Apple placeholder)
router.post("/oauth", oauthLogin);

module.exports = router;
