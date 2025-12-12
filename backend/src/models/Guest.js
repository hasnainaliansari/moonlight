// src/models/Guest.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const guestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true, // har guest ek hi email
    },

    // 🔹 Portal login ke liye
    password: {
      type: String,
      minlength: 6,
      // required: false  // manual guests ke liye optional
    },

    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    preferences: {
      type: String, // e.g. "High floor, non-smoking"
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isVIP: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔹 Social login metadata (optional)
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook", "apple"],
      default: "local",
    },
    providerId: {
      type: String,
    },

    // Staff ne manually create kiya ho to
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // staff member who created this guest
    },
  },
  { timestamps: true }
);

// Fast lookup by email
guestSchema.index({ email: 1 });

/**
 * Password hash – sirf tab jab password set ya change ho
 */
guestSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare password – agar password hi nahi set to false
 */
guestSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

const Guest = mongoose.model("Guest", guestSchema);

module.exports = Guest;
