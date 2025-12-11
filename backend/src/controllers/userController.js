// src/controllers/userController.js
const User = require("../models/User");

const STAFF_ROLES = [
  "admin",
  "manager",
  "receptionist",
  "housekeeping",
  "maintenance",
];

// GET /api/users  (admin only) – list staff
const getStaffUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: STAFF_ROLES } })
      .sort({ createdAt: -1 });

    // password ko expose nahi karna
    const shaped = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.json({
      count: shaped.length,
      users: shaped,
    });
  } catch (error) {
    console.error("Get staff error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users  (admin only) – create staff
const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const finalRole = role || "receptionist";

    if (!STAFF_ROLES.includes(finalRole)) {
      return res.status(400).json({ message: "Invalid role for staff user" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,    // hashing User model ke pre('save') se ho jayegi
      role: finalRole,
    });

    res.status(201).json({
      message: "Staff user created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/users/:id  (admin only) – update name/role/password
const updateStaffUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, password } = req.body;

    const user = await User.findById(id);
    if (!user || !STAFF_ROLES.includes(user.role)) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    if (name) user.name = name;
    if (role) {
      if (!STAFF_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    // agar password diya hai aur length ok hai to change kar do
    if (password && password.trim().length >= 6) {
      user.password = password.trim(); // hash pre('save') se ho ga
    }

    await user.save();

    res.json({
      message: "Staff user updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update staff user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/users/:id/status  (admin only) – activate/deactivate
const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { isActive } = req.body;

    // Allow "true"/"false" as strings
    if (typeof isActive === "string") {
      if (isActive.toLowerCase() === "true") isActive = true;
      else if (isActive.toLowerCase() === "false") isActive = false;
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message:
          'isActive must be a boolean (true/false). Example: { "isActive": false }',
      });
    }

    const user = await User.findById(id);

    if (!user || !STAFF_ROLES.includes(user.role)) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: "Staff status updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update staff status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  updateStaffStatus,
};
