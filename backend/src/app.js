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

// New routes
const reviewRoutes = require("./routes/reviewRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

/* ---------------- Core middlewares ---------------- */

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev
      // production frontend (Vercel) – apna exact domain yahan daal dena
      "https://moonlight-iegortj1m-hasnainaliansari221-gmailcoms-projects.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- Basic health routes ---------------- */

// simple text on root – handy to quickly check API is alive
app.get("/", (req, res) => {
  res.send("Moonlight Hotel API is running ✔");
});

// JSON health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Moonlight Hotel API is running ✨" });
});

/* ---------------- API routes ---------------- */

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

// Reviews (guest feedback)
app.use("/api/reviews", reviewRoutes);

// Profile (guest self dashboard)
app.use("/api/profile", profileRoutes);

/* ---------------- 404 handler ---------------- */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

module.exports = app;
