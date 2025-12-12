// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");   // staff only
const Guest = require("../models/Guest"); // guests portal
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

const generateToken = (subjectId, role) => {
  return jwt.sign({ userId: subjectId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Helper: create or fetch GUEST from social profile
 */
async function findOrCreateOAuthGuest({ email, name, provider, providerId }) {
  if (!email) throw new Error("Email is required from provider");

  const normalizedEmail = email.toLowerCase().trim();

  let guest = await Guest.findOne({ email: normalizedEmail });

  if (!guest) {
    const randomPassword =
      Math.random().toString(36).slice(-10) + Date.now().toString(36);

    guest = await Guest.create({
      fullName: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: randomPassword,          // hash ho jayega pre-save hook se
      authProvider: provider,
      providerId,
      isActive: true,
    });

    sendWelcomeEmail({ name: guest.fullName, email: guest.email });
  } else {
    let changed = false;
    if (!guest.authProvider || guest.authProvider === "local") {
      guest.authProvider = provider;
      changed = true;
    }
    if (!guest.providerId && providerId) {
      guest.providerId = providerId;
      changed = true;
    }
    if (changed) {
      await guest.save();
    }
  }

  return guest;
}

/**
 * --------- PUBLIC GUEST SIGNUP (email/password) ----------
 * POST /api/auth/register
 * 👉 Sirf guests collection me save karega
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

    // Staff collection me check mat karo, woh alag flow hai
    const existingGuest = await Guest.findOne({ email: normalizedEmail });
    if (existingGuest) {
      return res
        .status(400)
        .json({ message: "Guest with this email already exists" });
    }

    const guest = await Guest.create({
      fullName: name,
      email: normalizedEmail,
      password,
      phone,
      authProvider: "local",
      isActive: true,
    });

    const token = generateToken(guest._id, "guest");

    sendWelcomeEmail({
      name: guest.fullName,
      email: guest.email,
    });

    res.status(201).json({
      message: "Guest registered successfully",
      user: {
        id: guest._id,
        name: guest.fullName,
        email: guest.email,
        role: "guest",
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
 * 👉 Email staff me mila to staff login, warna guest me search
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1) Staff user? (users collection)
    let account = await User.findOne({ email: normalizedEmail });
    if (account) {
      if (!account.isActive) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await account.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = generateToken(account._id, account.role);

      const safeUser = {
        id: account._id,
        name: account.name,
        email: account.email,
        role: account.role, // admin / manager / receptionist / ...
      };

      sendLoginAlertEmail({
        name: account.name,
        email: account.email,
      });

      return res.json({
        message: "Login successful",
        user: safeUser,
        token,
      });
    }

    // 2) Guest account? (guests collection)
    const guest = await Guest.findOne({ email: normalizedEmail });
    if (!guest || guest.isActive === false) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await guest.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(guest._id, "guest");

    const safeGuestUser = {
      id: guest._id,
      name: guest.fullName,
      email: guest.email,
      role: "guest",
    };

    sendLoginAlertEmail({
      name: guest.fullName,
      email: guest.email,
    });

    return res.json({
      message: "Login successful",
      user: safeGuestUser,
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
 * 👉 Staff ya guest – jis bhi collection me mile
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let account = await User.findOne({ email: normalizedEmail });
    let displayName;

    if (account) {
      displayName = account.name;
    } else {
      const guest = await Guest.findOne({ email: normalizedEmail });
      if (guest) {
        account = guest;
        displayName = guest.fullName;
      }
    }

    // Same response even if account not found (security best-practice)
    if (!account) {
      return res.json({
        message:
          "If an account exists with this email, a reset code has been sent.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    passwordResetStore.set(normalizedEmail, { code, expiresAt });

    const subject = `Your ${HOTEL_NAME} password reset code`;
    const text = `Hello ${displayName || "Guest"},

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
 * 👉 Staff ya guest – jis bhi collection me mile
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
      return res
        .status(400)
        .json({ message: "Invalid or expired reset code" });
    }

    let account = await User.findOne({ email: normalizedEmail });
    if (!account) {
      account = await Guest.findOne({ email: normalizedEmail });
    }

    if (!account) {
      passwordResetStore.delete(normalizedEmail);
      return res.status(400).json({ message: "Account not found" });
    }

    account.password = newPassword; // hash User/Guest model ke pre-save se ho jayega
    await account.save();

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
 * 👉 Guests ke liye OAuth (staff ko email/password se hi rakho)
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

    // ✅ Guest as OAuth user
    const guest = await findOrCreateOAuthGuest({
      email: profile.email,
      name: profile.name,
      provider,
      providerId: profile.providerId,
    });

    if (guest.isActive === false) {
      return res
        .status(403)
        .json({ message: "Account is disabled. Please contact support." });
    }

    const token = generateToken(guest._id, "guest");

    const safeGuestUser = {
      id: guest._id,
      name: guest.fullName,
      email: guest.email,
      role: "guest",
    };

    res.json({
      message: "Login successful",
      user: safeGuestUser,
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
