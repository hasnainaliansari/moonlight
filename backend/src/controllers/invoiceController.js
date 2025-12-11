// src/controllers/invoiceController.js
const Invoice = require("../models/Invoice");
const Booking = require("../models/Booking");
const Setting = require("../models/Setting");
const { generateInvoicePdf } = require("../utils/pdfGenerator");
const { sendInvoiceEmail } = require("../utils/email");

// Helper to compute nights
const calculateNights = (checkInDate, checkOutDate) => {
  const inDate = new Date(checkInDate);
  const outDate = new Date(checkOutDate);
  const diffMs = outDate - inDate;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Helper to generate next invoice number based on prefix
const generateInvoiceNumber = async (invoicePrefix) => {
  const prefix = invoicePrefix || "INV-";

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;

  if (lastInvoice && lastInvoice.invoiceNumber) {
    const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const padded = String(nextNumber).padStart(5, "0");
  return `${prefix}${padded}`;
};

// POST /api/invoices/from-booking/:bookingId
// Create invoice based on an existing booking
const createInvoiceFromBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { extraCharges } = req.body;

    const booking = await Booking.findById(bookingId).populate("room");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Load settings (tax, currency, invoice prefix, etc.)
    const settings = await Setting.findOne().lean();
    const taxRate = settings?.taxRate ?? 0; // e.g. 10 means 10%
    const currencyCode =
      settings?.currency || settings?.currencyCode || "USD";
    const invoicePrefix = settings?.invoicePrefix || "INV-";

    const nights = calculateNights(
      booking.checkInDate,
      booking.checkOutDate
    );

    const roomRate = booking.room.pricePerNight;
    const baseAmount = nights * roomRate;

    let extrasTotal = 0;
    const normalizedExtras =
      extraCharges && Array.isArray(extraCharges)
        ? extraCharges.map((e) => {
            const amount = Number(e.amount) || 0;
            extrasTotal += amount;
            return {
              description: e.description,
              amount,
            };
          })
        : [];

    const subTotal = baseAmount + extrasTotal;
    const taxAmount = (subTotal * taxRate) / 100;
    const totalAmount = Math.round((subTotal + taxAmount) * 100) / 100;

    const invoiceNumber = await generateInvoiceNumber(invoicePrefix);

    const invoice = await Invoice.create({
      booking: booking._id,
      invoiceNumber,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      roomNumber: booking.room.roomNumber,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      nights,
      roomRate,
      baseAmount,
      extraCharges: normalizedExtras,
      subTotal,
      taxRate,
      taxAmount,
      totalAmount,
      currencyCode,
      status: "unpaid",
      createdBy: req.user.id,
    });

    // Try to generate PDF and send email, but do not break response if it fails
    try {
      const pdfBuffer = await generateInvoicePdf(
        invoice.toObject(),
        settings
      );
      await sendInvoiceEmail(invoice.toObject(), pdfBuffer, settings);
    } catch (emailErr) {
      console.error("Error sending invoice email:", emailErr);
    }

    res.status(201).json({
      message: "Invoice created from booking",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("booking", "guestName guestEmail status")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("booking")
      .populate("createdBy", "name email role");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/invoices/candidates
// Bookings that do not yet have any invoice
const getInvoiceCandidates = async (req, res) => {
  try {
    const invoicedBookingIds = await Invoice.find().distinct("booking");

    const filter = {
      _id: { $nin: invoicedBookingIds },
      status: { $in: ["confirmed", "checked_in", "checked_out"] },
    };

    const bookings = await Booking.find(filter)
      .populate("room", "roomNumber type pricePerNight")
      .sort({ checkInDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get invoice candidates error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/invoices/:id/pay
const markInvoicePaid = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.status = "paid";
    invoice.paymentMethod = paymentMethod || "cash";
    invoice.paidAt = new Date();

    await invoice.save();

    res.json({
      message: "Invoice marked as paid",
      invoice,
    });
  } catch (error) {
    console.error("Mark invoice paid error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/invoices/:id/pdf
const downloadInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const settings = await Setting.findOne().lean();

    const pdfBuffer = await generateInvoicePdf(
      invoice.toObject(),
      settings
    );

    const fileName = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Download invoice PDF error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createInvoiceFromBooking,
  getInvoices,
  getInvoiceById,
  getInvoiceCandidates,
  markInvoicePaid,
  downloadInvoicePdf,
};
