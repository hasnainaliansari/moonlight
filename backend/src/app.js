// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

// Existing routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const housekeepingRoutes = require("./routes/housekeepingRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const guestRoutes = require("./routes/guestRoutes");
const settingRoutes = require("./routes/settingRoutes");

// 🆕 New routes
const reviewRoutes = require("./routes/reviewRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth
app.use("/api/auth", authRoutes);

// Users / staff
app.use("/api/users", userRoutes);

// Rooms
app.use("/api/rooms", roomRoutes);

// Bookings
app.use("/api/bookings", bookingRoutes);

// Invoices
app.use("/api/invoices", invoiceRoutes);

// Housekeeping
app.use("/api/housekeeping", housekeepingRoutes);

// Maintenance
app.use("/api/maintenance", maintenanceRoutes);

// Reports
app.use("/api/reports", reportRoutes);

// Guests
app.use("/api/guests", guestRoutes);

// Settings (hotel info, tax, etc.)
app.use("/api/settings", settingRoutes);

// 🆕 Reviews (guest feedback)
app.use("/api/reviews", reviewRoutes);

// 🆕 Profile (guest self dashboard)
app.use("/api/profile", profileRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Moonlight Hotel API is running ✨" });
});

module.exports = app;
