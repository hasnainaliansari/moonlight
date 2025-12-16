// src/models/Booking.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const bookingSchema = new mongoose.Schema(
  {
    // Link to Guest profile (optional for legacy data)
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
    },

    // Denormalized guest info – useful for reporting
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    guestPhone: {
      type: String,
      trim: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },

    numGuests: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "confirmed",
    },

    // ✅ Digital room key generated on check-in
    checkInKey: {
      type: String,
      trim: true,
      default: null,
    },

    // ✅ Optional expiry
    keyExpiresAt: {
      type: Date,
      default: null,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // receptionist / manager / admin who created the booking
      required: true,
    },
  },
  { timestamps: true }
);

// ---- helpers ----
function generateRoomKey() {
  // 8 chars hex
  return crypto.randomBytes(4).toString("hex");
}

// ✅ Pre-save: generate key + set expiry + mark email trigger
bookingSchema.pre("save", function (next) {
  try {
    this.$locals = this.$locals || {};

    // When status changes to checked_in
    if (this.isModified("status") && this.status === "checked_in") {
      // generate key if missing
      if (!this.checkInKey) {
        this.checkInKey = generateRoomKey();
      }

      // set expiry if missing => default to checkOutDate
      if (!this.keyExpiresAt && this.checkOutDate) {
        this.keyExpiresAt = new Date(this.checkOutDate);
      }

      // mark to send email after save
      this.$locals._sendCheckInKeyEmail = true;
    }

    // When status changes to checked_out => expire key now
    if (this.isModified("status") && this.status === "checked_out") {
      this.keyExpiresAt = new Date();
    }

    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Post-save: send email (non-blocking)
bookingSchema.post("save", function (doc) {
  const shouldSend = doc?.$locals?._sendCheckInKeyEmail;

  if (!shouldSend) return;

  (async () => {
    try {
      // load room (for email template details)
      const Room = require("./Room");
      const room = await Room.findById(doc.room).select("roomNumber type");

      // use existing email util (NO changes in email.js required)
      const { sendBookingCheckInKeyEmail } = require("../utils/email");

      await sendBookingCheckInKeyEmail(doc, room);
    } catch (err) {
      console.error("[Booking model] check-in key email failed:", err?.message);
    }
  })();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
