// src/controllers/reportController.js
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Invoice = require("../models/Invoice");

// GET /api/reports/summary
// High-level dashboard summary
const getSummary = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: "occupied" });
    const availableRooms = await Room.countDocuments({ status: "available" });

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todaysCheckIns = await Booking.countDocuments({
      checkInDate: { $gte: startOfToday, $lt: endOfToday },
    });

    const todaysCheckOuts = await Booking.countDocuments({
      checkOutDate: { $gte: startOfToday, $lt: endOfToday },
    });

    // Total revenue from paid invoices
    const revenueAgg = await Invoice.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const unpaidInvoices = await Invoice.countDocuments({ status: "unpaid" });

    const occupancyRate =
      totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate: Math.round(occupancyRate),
      todaysCheckIns,
      todaysCheckOuts,
      totalRevenue,
      unpaidInvoices,
    });
  } catch (error) {
    console.error("Get summary report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
const getRevenueByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;

    let fromDate = from ? new Date(from) : new Date();
    let toDate = to ? new Date(to) : new Date();

    if (!from) {
      // default last 30 days
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
    }

    // ensure toDate is end of day
    toDate.setHours(23, 59, 59, 999);

    const data = await Invoice.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      from: fromDate,
      to: toDate,
      points: data, // each { _id: '2025-11-26', total, count }
    });
  } catch (error) {
    console.error("Get revenue report error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSummary,
  getRevenueByDateRange,
};
