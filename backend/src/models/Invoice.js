// src/models/Invoice.js
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Display / lookup
    invoiceNumber: {
      type: String, // e.g. "INV-00001"
    },

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
    roomNumber: {
      type: String,
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
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    roomRate: {
      type: Number,
      required: true,
      min: 0,
    },

    // Base room charges
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Extra items (laundry, airport pickup, etc.)
    extraCharges: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],

    // Base + extras (before tax)
    subTotal: {
      type: Number,
      min: 0,
    },

    // Tax info from settings
    taxRate: {
      type: Number, // percentage, e.g. 10 means 10%
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Final amount (subTotal + tax)
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currencyCode: {
      type: String, // e.g. "USD", "PKR"
      default: "USD",
    },

    status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String, // e.g. "cash", "card", "online"
    },
    paidAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // staff who generated invoice
      required: true,
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
