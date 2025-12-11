// src/utils/pdfGenerator.js
const PDFDocument = require("pdfkit");

/**
 * Generate a PDF buffer for an invoice.
 * @param {Object} invoice - Plain JS object of invoice (invoice.toObject()).
 * @param {Object} settings - Hotel settings document (plain object or null).
 * @returns {Promise<Buffer>}
 */
const generateInvoicePdf = async (invoice, settings) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const hotelName = settings?.hotelName || "Moonlight Hotel";
      const hotelAddress = settings?.hotelAddress || "";
      const hotelEmail = settings?.hotelEmail || "";
      const hotelPhone = settings?.hotelPhone || "";

      const formatDate = (value) => {
        if (!value) return "";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 10);
      };

      // Header
      doc.fontSize(20).text(hotelName, { align: "left" });
      doc.moveDown(0.2);

      doc.fontSize(10);
      if (hotelAddress) doc.text(hotelAddress);
      if (hotelPhone) doc.text(`Phone: ${hotelPhone}`);
      if (hotelEmail) doc.text(`Email: ${hotelEmail}`);

      doc.moveDown(1);

      // Invoice meta
      doc
        .fontSize(16)
        .text("Invoice", { align: "right" })
        .moveDown(0.3);

      doc.fontSize(10);
      doc.text(`Invoice #: ${invoice.invoiceNumber || invoice._id}`, {
        align: "right",
      });
      doc.text(`Date: ${formatDate(invoice.createdAt)}`, {
        align: "right",
      });

      doc.moveDown(1);

      // Bill to
      doc.fontSize(12).text("Bill To:", { underline: true });
      doc.moveDown(0.2);
      doc.fontSize(10);
      doc.text(invoice.guestName || "");
      doc.text(invoice.guestEmail || "");
      doc.moveDown(0.5);

      // Stay details
      doc.fontSize(12).text("Stay Details:", { underline: true });
      doc.moveDown(0.2);
      doc.fontSize(10);
      doc.text(`Room: ${invoice.roomNumber}`, { continued: true }).text(
        `   Nights: ${invoice.nights}`,
      );
      doc.text(
        `Check-in: ${formatDate(invoice.checkInDate)}   Check-out: ${formatDate(
          invoice.checkOutDate,
        )}`,
      );

      doc.moveDown(1);

      // Table header
      const startX = 50;
      let y = doc.y;

      const colDesc = 50;
      const colQty = 300;
      const colPrice = 360;
      const colAmount = 440;

      doc.fontSize(11).text("Description", colDesc, y);
      doc.text("Qty", colQty, y);
      doc.text("Price", colPrice, y);
      doc.text("Amount", colAmount, y);
      doc.moveTo(startX, y + 14).lineTo(550, y + 14).stroke();

      y += 22;
      doc.fontSize(10);

      const currency = invoice.currencyCode || "USD";

      const formatMoney = (value) => {
        if (typeof value !== "number") return `${currency} ${value}`;
        return `${currency} ${value.toFixed(2)}`;
      };

      // Room line
      doc.text(
        `Room ${invoice.roomNumber} (${invoice.nights} night(s))`,
        colDesc,
        y,
      );
      doc.text(String(invoice.nights), colQty, y);
      doc.text(formatMoney(invoice.roomRate), colPrice, y);
      doc.text(formatMoney(invoice.baseAmount), colAmount, y);

      y += 18;

      // Extra charges
      if (Array.isArray(invoice.extraCharges) && invoice.extraCharges.length) {
        invoice.extraCharges.forEach((extra) => {
          doc.text(extra.description, colDesc, y);
          doc.text("1", colQty, y);
          doc.text(formatMoney(extra.amount), colPrice, y);
          doc.text(formatMoney(extra.amount), colAmount, y);
          y += 16;
        });
      }

      doc.moveDown(1.2);
      y = doc.y;

      // Totals
      const totalsX = 360;
      doc.fontSize(10);

      if (typeof invoice.subTotal === "number") {
        doc.text("Subtotal:", totalsX, y);
        doc.text(formatMoney(invoice.subTotal), colAmount, y, {
          align: "left",
        });
        y += 14;
      }

      if (invoice.taxRate && invoice.taxRate > 0) {
        doc.text(`Tax (${invoice.taxRate}%)`, totalsX, y);
        doc.text(formatMoney(invoice.taxAmount || 0), colAmount, y, {
          align: "left",
        });
        y += 14;
      }

      doc.fontSize(11).text("Total:", totalsX, y);
      doc.fontSize(11).text(formatMoney(invoice.totalAmount), colAmount, y, {
        align: "left",
      });

      doc.moveDown(2);
      doc.fontSize(10).text("Thank you for staying with us!", {
        align: "center",
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoicePdf,
};
