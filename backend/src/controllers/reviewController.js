// controllers/reviewController.js
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Guest = require("../models/Guest");
const User = require("../models/User");

/**
 * POST /api/reviews
 * Guest creates a review for their own booking.
 */
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res
        .status(400)
        .json({ message: "bookingId and rating are required" });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.user.id).select("email name");
    if (!user || !user.email) {
      return res
        .status(400)
        .json({ message: "Your account does not have an email address." });
    }

    const booking = await Booking.findById(bookingId).populate("room guest");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const userEmail = user.email.toLowerCase();
    if (booking.guestEmail !== userEmail) {
      return res.status(403).json({
        message: "You can only review bookings made under your email address.",
      });
    }

    // Prevent duplicate review for the same booking + user
    const existing = await Review.findOne({
      booking: booking._id,
      user: req.user.id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already submitted a review for this booking." });
    }

    // Set proper guest reference
    let guestId = booking.guest || null;
    if (!guestId) {
      const guestDoc =
        (await Guest.findOne({ email: booking.guestEmail })) ||
        (await Guest.findOne({ email: userEmail }));
      if (guestDoc) {
        guestId = guestDoc._id;
      }
    }

    const review = await Review.create({
      guest: guestId,
      user: req.user.id,
      room: booking.room,
      booking: booking._id,
      rating: numericRating,
      comment: comment || "",
    });

    res.status(201).json({
      message: "Thank you for your feedback!",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/reviews/my
 * Authenticated user reviews (guest side)
 */
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("room", "roomNumber type")
      .populate("booking", "checkInDate checkOutDate")
      .sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/reviews
 * Admin / staff – list all reviews
 */
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email role")
      .populate("guest", "fullName email")
      .populate("room", "roomNumber type")
      .populate("booking", "checkInDate checkOutDate")
      .sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/reviews/:id
 * Admin / staff – update status / isPublic
 */
const updateReviewModeration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isPublic } = req.body;

    const update = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      update.status = status;
    }

    if (typeof isPublic === "boolean") {
      update.isPublic = isPublic;
      // If making it public and status isn't set, auto-approve
      if (isPublic && !update.status) {
        update.status = "approved";
      }
    }

    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: "Nothing to update for this review." });
    }

    const review = await Review.findByIdAndUpdate(id, update, {
      new: true,
    })
      .populate("user", "name email role")
      .populate("guest", "fullName email")
      .populate("room", "roomNumber type")
      .populate("booking", "checkInDate checkOutDate");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      message: "Review updated.",
      review,
    });
  } catch (error) {
    console.error("Update review moderation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/reviews/public/:roomId
 * Public endpoint – approved + isPublic=true reviews for a room
 */
const getPublicReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // If id is missing OR not a valid ObjectId, just return empty list (no crash)
    if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.json({ count: 0, reviews: [] });
    }

    const reviews = await Review.find({
      room: roomId,
      status: "approved",
      isPublic: true,
    })
      .populate("guest", "fullName")
      .populate("room", "roomNumber type")
      .populate("booking", "checkInDate checkOutDate")
      .sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get public reviews by room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getAllReviews,
  updateReviewModeration,
  getPublicReviewsByRoom,
};
