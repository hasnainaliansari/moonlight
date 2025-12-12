// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Guest = require("../models/Guest");
const { sendWelcomeEmail, sendLoginAlertEmail } = require("../utils/email");

// OAuth imports
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

// Constants
const HOTEL_NAME = process.env.HOTEL_NAME || "Moonlight Hotel";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Separate transporter for password reset (reuses same SMTP env)
const resetTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// In-memory store for reset codes (email -> { code, expiresAt })
const passwordResetStore = new Map();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Helper: create or fetch user from social profile
 */
async function findOrCreateOAuthUser({ email, name, provider, providerId }) {
  if (!email) {
    throw new Error("Email is required from provider");
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    // Random password – user will not use it directly, it's only for schema requirements
    const randomPassword =
      Math.random().toString(36).slice(-10) + Date.now().toString(36);

    user = await User.create({
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: randomPassword,
      role: "guest",
      authProvider: provider,
      providerId,
    });

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail({ name: user.name, email: user.email });
  } else {
    // User already exists – update provider info (optional)
    let changed = false;

    if (!user.authProvider || user.authProvider === "local") {
      user.authProvider = provider;
      changed = true;
    }
    if (!user.providerId && providerId) {
      user.providerId = providerId;
      changed = true;
    }

    if (changed) {
      await user.save();
    }
  }

  return user;
}

/**
 * --------- PUBLIC GUEST SIGNUP (email/password) ----------
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Always assign guest role; for staff use /api/users
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "guest",
      authProvider: "local",
    });

    // Also create a record in Guest collection (if it doesn't already exist)
    let guest = await Guest.findOne({ email: normalizedEmail });

    if (!guest) {
      guest = await Guest.create({
        fullName: name,
        email: normalizedEmail,
        phone,
        isActive: true,
      });
    }

    const token = generateToken(user._id, user.role);

    // 🔹 Welcome email
    sendWelcomeEmail({
      name: user.name,
      email: user.email,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 'guest'
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * --------- NORMAL LOGIN (email/password) ----------
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 🔹 Login notification email
    sendLoginAlertEmail({
      name: user.name,
      email: user.email,
    });

    res.json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * --------- FORGOT PASSWORD ----------
 * POST /api/auth/forgot-password
 * body: { email }
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Same response even if user not found (security best-practice)
    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a reset code has been sent.",
      });
    }

    // 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    passwordResetStore.set(normalizedEmail, { code, expiresAt });

    const subject = `Your ${HOTEL_NAME} password reset code`;
    const text = `Hello ${user.name || "Guest"},

We received a request to reset the password for your ${HOTEL_NAME} account.

Your password reset code is: ${code}

This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.

Warm regards,
${HOTEL_NAME}
`;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await resetTransporter.sendMail({
          from:
            process.env.SMTP_FROM ||
            `${HOTEL_NAME} <${process.env.SMTP_USER}>`,
          to: normalizedEmail,
          subject,
          text,
        });
      } catch (err) {
        console.error("Failed to send reset email:", err.message);
      }
    } else {
      console.warn("SMTP_USER / SMTP_PASS not set – cannot send reset email.");
    }

    return res.json({
      message:
        "If an account exists with this email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * --------- RESET PASSWORD ----------
 * POST /api/auth/reset-password
 * body: { email, code, newPassword }
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, code and newPassword are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const entry = passwordResetStore.get(normalizedEmail);

    if (!entry) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset code" });
    }

    if (entry.expiresAt < Date.now()) {
      passwordResetStore.delete(normalizedEmail);
      return res
        .status(400)
        .json({ message: "Invalid or expired reset code" });
    }

    if (entry.code !== code) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset code" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      passwordResetStore.delete(normalizedEmail);
      return res.status(400).json({ message: "User not found" });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    passwordResetStore.delete(normalizedEmail);

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * --------- SOCIAL LOGIN (Google / Facebook / Apple placeholder) ----------
 * POST /api/auth/oauth
 * body: { provider: 'google' | 'facebook' | 'apple', idToken?, accessToken? }
 */
const oauthLogin = async (req, res) => {
  try {
    const { provider, idToken, accessToken } = req.body;

    if (!provider) {
      return res.status(400).json({ message: "Provider is required" });
    }

    let profile;

    if (provider === "google") {
      if (!idToken) {
        return res
          .status(400)
          .json({ message: "Google idToken is required" });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      profile = {
        email: payload.email,
        name: payload.name,
        providerId: payload.sub,
      };
    } else if (provider === "facebook") {
      if (!accessToken) {
        return res
          .status(400)
          .json({ message: "Facebook accessToken is required" });
      }

      // Simple graph call to get basic profile
      const resp = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
      );
      if (!resp.ok) {
        return res.status(400).json({ message: "Invalid Facebook token" });
      }
      const data = await resp.json();

      profile = {
        email: data.email,
        name: data.name,
        providerId: data.id,
      };
    } else if (provider === "apple") {
      // NOTE: Apple verification is a bit complex.
      // For production, use a library like 'apple-signin-auth'.
      return res
        .status(400)
        .json({ message: "Apple OAuth not implemented yet" });
    } else {
      return res.status(400).json({ message: "Unsupported provider" });
    }

    if (!profile || !profile.email) {
      return res
        .status(400)
        .json({ message: "Could not read email from provider" });
    }

    const user = await findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name,
      provider,
      providerId: profile.providerId,
    });

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is disabled. Please contact support." });
    }

    const token = generateToken(user._id, user.role);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("OAuth login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  oauthLogin,
};
