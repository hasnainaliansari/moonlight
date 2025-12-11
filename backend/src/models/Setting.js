// backend/src/models/Setting.js
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      default: "Moonlight Hotel",
      trim: true,
    },
    hotelEmail: {
      type: String,
      default: "",
      trim: true,
    },
    hotelPhone: {
      type: String,
      default: "",
      trim: true,
    },
    hotelAddress: {
      type: String,
      default: "",
      trim: true,
    },
    currency: {
      type: String, // e.g. "USD", "PKR"
      default: "USD",
    },
    taxRate: {
      type: Number, // percent e.g. 10 = 10%
      default: 0,
      min: 0,
    },
    serviceChargeRate: {
      type: Number, // optional extra percent
      default: 0,
      min: 0,
    },
    checkInTime: {
      type: String, // "14:00"
      default: "14:00",
    },
    checkOutTime: {
      type: String, // "12:00"
      default: "12:00",
    },
    // future flags: autoEmailOnBooking, autoEmailOnInvoice, etc.
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
