// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Guest = require("../models/Guest");

const {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetCodeEmail,
} = require("../utils/email");

// OAuth imports
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

// Constants
const HOTEL_NAME = process.env.HOTEL_NAME || "Moonlight Hotel";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory store for reset codes (email -> { code, expiresAt })
const passwordResetStore = new Map();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Helper: ALWAYS ensure a Guest profile exists for this email.
 */
async function ensureGuestProfile({ email, name, phone }) {
  if (!email) return null;

  const normalizedEmail = email.toLowerCase().trim();

  let guest = await Guest.findOne({ email: normalizedEmail });

  if (!guest) {
    guest = await Guest.create({
      fullName: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      phone: phone || "",
      isActive: true,
    });
  } else {
    let changed = false;
    if (name && guest.fullName !== name) {
      guest.fullName = name;
      changed = true;
    }
    if (phone && guest.phone !== phone) {
      guest.phone = phone;
      changed = true;
    }
    if (changed) {
      await guest.save();
    }
  }

  return guest;
}

/**
 * Helper: create or fetch user from social profile
 */
async function findOrCreateOAuthUser({ email, name, provider, providerId }) {
  if (!email) throw new Error("Email is required from provider");

  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
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

    await ensureGuestProfile({ email: normalizedEmail, name });

    // fire-and-forget
    sendWelcomeEmail({ name: user.name, email: user.email }).catch(() => {});
  } else {
    let changed = false;

    if (!user.authProvider || user.authProvider === "local") {
      user.authProvider = provider;
      changed = true;
    }
    if (!user.providerId && providerId) {
      user.providerId = providerId;
      changed = true;
    }

    if (changed) await user.save();

    await ensureGuestProfile({ email: user.email, name: user.name });
  }

  return user;
}

/**
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

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "guest",
      authProvider: "local",
    });

    await ensureGuestProfile({ email: normalizedEmail, name, phone });

    const token = generateToken(user._id, user.role);

    // fire-and-forget
    sendWelcomeEmail({ name: user.name, email: user.email }).catch(() => {});

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
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

    // fire-and-forget
    sendLoginAlertEmail({ name: user.name, email: user.email }).catch(() => {});

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
 * POST /api/auth/forgot-password
 * body: { email }
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always return same response
    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a reset code has been sent.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    passwordResetStore.set(normalizedEmail, { code, expiresAt });

    // ✅ Gmail API reset code email
    sendPasswordResetCodeEmail(
      { name: user.name, email: normalizedEmail },
      code
    ).catch((err) => {
      console.error("Failed to send reset email (Gmail API):", err?.message);
    });

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

    if (!entry || entry.expiresAt < Date.now() || entry.code !== code) {
      passwordResetStore.delete(normalizedEmail);
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      passwordResetStore.delete(normalizedEmail);
      return res.status(400).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    passwordResetStore.delete(normalizedEmail);

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/oauth
 * body: { provider: 'google' | 'facebook' | 'apple', idToken?, accessToken? }
 */
const oauthLogin = async (req, res) => {
  try {
    const { provider, idToken, accessToken } = req.body;
    if (!provider) return res.status(400).json({ message: "Provider is required" });

    let profile;

    if (provider === "google") {
      if (!idToken) return res.status(400).json({ message: "Google idToken is required" });

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
        return res.status(400).json({ message: "Facebook accessToken is required" });
      }

      const resp = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
      );
      if (!resp.ok) return res.status(400).json({ message: "Invalid Facebook token" });

      const data = await resp.json();

      profile = {
        email: data.email,
        name: data.name,
        providerId: data.id,
      };
    } else if (provider === "apple") {
      return res.status(400).json({ message: "Apple OAuth not implemented yet" });
    } else {
      return res.status(400).json({ message: "Unsupported provider" });
    }

    if (!profile?.email) {
      return res.status(400).json({ message: "Could not read email from provider" });
    }

    const user = await findOrCreateOAuthUser({
      email: profile.email,
      name: profile.name,
      provider,
      providerId: profile.providerId,
    });

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled. Please contact support." });
    }

    await ensureGuestProfile({ email: user.email, name: user.name });

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
