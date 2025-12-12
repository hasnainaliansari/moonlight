// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

// Routes ...
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
const reviewRoutes = require("./routes/reviewRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

/**
 * CORS CONFIG
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://moonlight-oig106op7-hasnainaliansari221-gmailcoms-projects.vercel.app", // <-- tumhara Vercel URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / curl etc (no origin) → allow
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Agar kabhi koi random origin hit kare
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// preflight ke liye
app.options("*", cors());

app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Moonlight Hotel API is running ✨" });
});

module.exports = app;
