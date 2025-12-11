// backend/src/controllers/settingController.js
const Setting = require("../models/Setting");

// Helper: ensure we always have exactly one settings document
const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return settings;
};

// GET /api/settings
// Return single settings document
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/settings
// Update settings (admin/manager only ideally)
const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    const {
      hotelName,
      hotelEmail,
      hotelPhone,
      hotelAddress,
      currency,
      taxRate,
      serviceChargeRate,
      checkInTime,
      checkOutTime,
    } = req.body;

    if (hotelName !== undefined) settings.hotelName = hotelName;
    if (hotelEmail !== undefined) settings.hotelEmail = hotelEmail;
    if (hotelPhone !== undefined) settings.hotelPhone = hotelPhone;
    if (hotelAddress !== undefined) settings.hotelAddress = hotelAddress;
    if (currency !== undefined) settings.currency = currency;
    if (taxRate !== undefined) settings.taxRate = Number(taxRate) || 0;
    if (serviceChargeRate !== undefined) {
      settings.serviceChargeRate = Number(serviceChargeRate) || 0;
    }
    if (checkInTime !== undefined) settings.checkInTime = checkInTime;
    if (checkOutTime !== undefined) settings.checkOutTime = checkOutTime;

    await settings.save();

    res.json({
      message: "Settings updated",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
