// src/controllers/profileController.js
const User = require("../models/User");
const Guest = require("../models/Guest");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// GET /api/profile/me
// Logged-in user's profile + guest details + bookings + reviews
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const email = user.email.toLowerCase();

    const guest = await Guest.findOne({ email });

    const bookings = await Booking.find({ guestEmail: email })
      .populate("room", "roomNumber type")
      .sort({ checkInDate: -1 });

    let reviews = [];
    if (guest) {
      reviews = await Review.find({ guest: guest._id })
        .populate("room", "roomNumber type")
        .populate("booking", "checkInDate checkOutDate")
        .sort({ createdAt: -1 });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      guest, // full guest doc (address, city, country, etc.)
      bookings,
      reviews,
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/profile/me
// Update name + contact / address fields
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address, city, country, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      user.name = name;
    }
    // Email change is not allowed for now – keeping it simple
    await user.save();

    const email = user.email.toLowerCase();

    let guest = await Guest.findOne({ email });
    if (!guest) {
      guest = new Guest({
        fullName: name || user.name,
        email,
        phone: phone || "",
        address: address || "",
        city: city || "",
        country: country || "",
        preferences: preferences || "",
        isVIP: false,
        isActive: true,
      });
    } else {
      if (name) guest.fullName = name;
      if (phone !== undefined) guest.phone = phone;
      if (address !== undefined) guest.address = address;
      if (city !== undefined) guest.city = city;
      if (country !== undefined) guest.country = country;
      if (preferences !== undefined) guest.preferences = preferences;
    }

    await guest.save();

    // Send fresh profile back
    const bookings = await Booking.find({ guestEmail: email })
      .populate("room", "roomNumber type")
      .sort({ checkInDate: -1 });

    const reviews = await Review.find({ guest: guest._id })
      .populate("room", "roomNumber type")
      .populate("booking", "checkInDate checkOutDate")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      guest,
      bookings,
      reviews,
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/profile/change-password
const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changeMyPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
};
