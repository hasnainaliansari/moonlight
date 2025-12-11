// src/controllers/guestController.js
const Guest = require("../models/Guest");
const Booking = require("../models/Booking");

// POST /api/guests
// Create a new guest profile (manual from Guests screen)
const createGuest = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      country,
      preferences,
      notes,
      isVIP,
    } = req.body;

    if (!fullName || !email) {
      return res
        .status(400)
        .json({ message: "fullName and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // avoid exact duplicate (same email)
    const existing = await Guest.findOne({ email: normalizedEmail });
    if (existing) {
      // same behaviour as pehle: hard error dena ho to yeh line use karo
      return res
        .status(400)
        .json({ message: "Guest with this email already exists" });

      // agar duplicate allow karne hon to upar return hata sakte ho
    }

    const guest = await Guest.create({
      fullName,
      email: normalizedEmail,
      phone,
      address,
      city,
      country,
      preferences,
      notes,
      isVIP: !!isVIP,
      isActive: true,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      message: "Guest created successfully",
      guest,
    });
  } catch (error) {
    console.error("Create guest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/guests
// List guests with optional search & filters
const getGuests = async (req, res) => {
  try {
    const { search, isActive, isVIP } = req.query;

    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { city: regex },
        { country: regex },
      ];
    }

    if (typeof isActive !== "undefined") {
      if (isActive === "true") filter.isActive = true;
      else if (isActive === "false") filter.isActive = false;
    }

    if (typeof isVIP !== "undefined") {
      if (isVIP === "true") filter.isVIP = true;
      else if (isVIP === "false") filter.isVIP = false;
    }

    const guests = await Guest.find(filter).sort({ createdAt: -1 });

    res.json({
      count: guests.length,
      guests,
    });
  } catch (error) {
    console.error("Get guests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/guests/:id
const getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    res.json(guest);
  } catch (error) {
    console.error("Get guest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/guests/:id
// Update guest profile (info, preferences, flags)
const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      address,
      city,
      country,
      preferences,
      notes,
      isVIP,
      isActive,
    } = req.body;

    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    if (typeof fullName === "string") guest.fullName = fullName;
    if (typeof email === "string")
      guest.email = email.toLowerCase().trim();
    if (typeof phone === "string") guest.phone = phone;
    if (typeof address === "string") guest.address = address;
    if (typeof city === "string") guest.city = city;
    if (typeof country === "string") guest.country = country;
    if (typeof preferences === "string") guest.preferences = preferences;
    if (typeof notes === "string") guest.notes = notes;

    if (typeof isVIP !== "undefined") guest.isVIP = !!isVIP;
    if (typeof isActive !== "undefined") guest.isActive = !!isActive;

    await guest.save();

    res.json({
      message: "Guest updated successfully",
      guest,
    });
  } catch (error) {
    console.error("Update guest error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/guests/:id/bookings
// Guest stay history – now uses Booking.guest OR guestEmail
const getGuestBookings = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    const bookings = await Booking.find({
      $or: [
        { guest: guest._id },          // naya data (linked by ObjectId)
        { guestEmail: guest.email },   // purana data (email only)
      ],
    })
      .populate("room", "roomNumber type")
      .sort({ checkInDate: -1 });

    res.json({
      guest: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
      },
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get guest bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGuest,
  getGuests,
  getGuestById,
  updateGuest,
  getGuestBookings,
};
