// src/controllers/bookingController.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Guest = require("../models/Guest");
const User = require("../models/User");
const {
  sendBookingPendingEmail,
  sendBookingConfirmedEmail,
} = require("../utils/email");

// Helper: calculate nights between 2 dates
const calculateNights = (checkInDate, checkOutDate) => {
  const inDate = new Date(checkInDate);
  const outDate = new Date(checkOutDate);
  const diffMs = outDate - inDate;
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return nights;
};

/**
 * STAFF booking creation
 * POST /api/bookings  (receptionist/manager/admin)
 */
const createBooking = async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      roomId,
      checkInDate,
      checkOutDate,
      numGuests,
    } = req.body;

    if (!guestName || !guestEmail || !roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message:
          "guestName, guestEmail, roomId, checkInDate and checkOutDate are required",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid check-in/check-out date" });
    }

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) {
      return res
        .status(400)
        .json({ message: "checkOutDate must be after checkInDate" });
    }

    // Prevent double booking (overlapping dates)
    const blockingBooking = await Booking.findOne({
      room: room._id,
      status: { $in: ["pending", "confirmed", "checked_in"] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (blockingBooking) {
      return res.status(400).json({
        message:
          "This room is already booked for the selected dates. Please choose another room or different dates.",
      });
    }

    // Upsert Guest profile using email
    const normalizedEmail = guestEmail.toLowerCase();

    const guest = await Guest.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          fullName: guestName,
          phone: guestPhone || "",
        },
        $setOnInsert: {
          email: normalizedEmail,
          status: "active",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const totalPrice = nights * room.pricePerNight;

    // Create booking and link guest
    const booking = await Booking.create({
      guest: guest._id,
      guestName,
      guestEmail: normalizedEmail,
      guestPhone,
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numGuests: numGuests || 1,
      status: "confirmed",
      totalPrice,
      createdBy: req.user.id,
    });

    // Staff flow: mark room occupied immediately
    room.status = "occupied";
    await room.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GUEST self-service booking
 * POST /api/bookings/self
 * - User must be authenticated (typically role "guest")
 * - Uses req.user.name / req.user.email as guest identity
 * - Status = "pending" and room.status does not change
 */
const createSelfBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, numGuests, guestPhone } =
      req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "roomId, checkInDate and checkOutDate are required",
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid check-in/check-out date" });
    }

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) {
      return res
        .status(400)
        .json({ message: "checkOutDate must be after checkInDate" });
    }

    // -----------------------------------
    //  EMAIL + NAME RESOLUTION
    // -----------------------------------
    let rawEmail = (req.user && req.user.email) || req.body.guestEmail || null;
    let guestName = req.user?.name || req.body.guestName || "";

    // If JWT does not have an email, load the user from DB
    if (!rawEmail) {
      try {
        const dbUser = await User.findById(req.user.id).select("email name");
        if (dbUser) {
          if (dbUser.email) rawEmail = dbUser.email;
          if (!guestName && dbUser.name) guestName = dbUser.name;
        }
      } catch (err) {
        console.warn("Could not load user for self booking:", err?.message);
      }
    }

    // Final safeguard: still no email? => placeholder
    if (!rawEmail) {
      rawEmail = `guest-${req.user.id || "unknown"}@no-email.moonlight.local`;
      console.warn(
        "[Moonlight] Self booking created with placeholder email for user:",
        req.user.id
      );
    }

    const guestEmail = rawEmail.toLowerCase();
    if (!guestName) guestName = "Guest";

    // Prevent double booking
    const blockingBooking = await Booking.findOne({
      room: room._id,
      status: { $in: ["pending", "confirmed", "checked_in"] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (blockingBooking) {
      return res.status(400).json({
        message:
          "This room is already booked for the selected dates. Please choose another room or different dates.",
      });
    }

    // Upsert Guest profile
    const guest = await Guest.findOneAndUpdate(
      { email: guestEmail },
      {
        $set: {
          fullName: guestName,
          phone: guestPhone || "",
        },
        $setOnInsert: {
          email: guestEmail,
          status: "active",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    const totalPrice = nights * room.pricePerNight;

    const booking = await Booking.create({
      guest: guest._id,
      guestName,
      guestEmail,
      guestPhone: guestPhone || "",
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numGuests: numGuests || 1,
      status: "pending", // guest bookings start as pending
      totalPrice,
      createdBy: req.user.id,
    });

    // Email: booking pending
    sendBookingPendingEmail(booking, room).catch((err) =>
      console.error("Pending email failed:", err?.message)
    );

    res.status(201).json({
      message:
        "Booking request submitted. Our team will review and confirm your stay.",
      booking,
    });
  } catch (error) {
    console.error("Create self booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/bookings  (all staff)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room", "roomNumber type pricePerNight status")
      .populate("guest", "fullName email phone status isVip")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room", "roomNumber type pricePerNight status")
      .populate("guest", "fullName email phone status isVip")
      .populate("createdBy", "name email role");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/bookings/:id/confirm
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be confirmed." });
    }

    booking.status = "confirmed";
    await booking.save();

    if (booking.room) {
      booking.room.status = "occupied";
      await booking.room.save();
    }

    // Email: booking confirmed
    sendBookingConfirmedEmail(booking, booking.room).catch((err) =>
      console.error("Confirm email failed:", err?.message)
    );

    res.json({
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    console.error("Confirm booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/bookings/:id/checkin
const checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "checked_in";
    await booking.save();

    booking.room.status = "occupied";
    await booking.room.save();

    res.json({
      message: "Guest checked in",
      booking,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/bookings/:id/checkout
const checkOutBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "checked_out";
    await booking.save();

    booking.room.status = "available";
    await booking.room.save();

    res.json({
      message: "Guest checked out",
      booking,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/bookings/my  (guest self – bookings by their email)
const getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("email");
    if (!user || !user.email) {
      return res
        .status(400)
        .json({ message: "Your account does not have an email address." });
    }

    const email = user.email.toLowerCase();

    const bookings = await Booking.find({ guestEmail: email })
      .populate("room", "roomNumber type pricePerNight status")
      .sort({ checkInDate: -1 });

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBooking,
  createSelfBooking,
  getBookings,
  getBookingById,
  checkInBooking,
  checkOutBooking,
  confirmBooking,
  getMyBookings,
};
