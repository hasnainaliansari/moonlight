// src/utils/email.js
const { google } = require("googleapis");
const MailComposer = require("nodemailer/lib/mail-composer");

const {
  welcomeTemplate,
  loginAlertTemplate,
  passwordResetCodeTemplate,
  bookingPendingTemplate,
  bookingConfirmedTemplate,
  invoiceTemplate,
  formatDate, // (optional helpers)
} = require("./emailTemplates");

const HOTEL_NAME = process.env.HOTEL_NAME || "Moonlight Hotel";

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || process.env.GMAIL_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI"
    );
  }

  if (!process.env.GMAIL_REFRESH_TOKEN) {
    throw new Error("Missing GMAIL_REFRESH_TOKEN");
  }

  const oAuth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oAuth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return oAuth2;
}

async function getGmailService() {
  const auth = getOAuthClient();
  await auth.getAccessToken(); // ensures it can refresh access token
  return google.gmail({ version: "v1", auth });
}

function getFrom(settings) {
  const sender = process.env.GMAIL_USER;
  if (!sender) throw new Error("Missing GMAIL_USER");

  const name = settings?.emailFromName || settings?.hotelName || HOTEL_NAME;
  return `"${name}" <${sender}>`;
}

/**
 * ✅ Now supports html + text both.
 * - Always send text fallback (recommended)
 * - HTML templates plug-and-play
 */
async function sendEmail({ to, subject, text, html, attachments, settings }) {
  if (!to) return;

  const gmail = await getGmailService();

  const mail = new MailComposer({
    from: getFrom(settings),
    to,
    subject,
    text: text || "", // fallback
    html: html || undefined, // ✅ html templates
    attachments: attachments || [],
  });

  const mime = await mail.compile().build();
  const raw = base64UrlEncode(mime);

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  console.log("[email] Sent (Gmail API):", subject, "→", to);
}

async function sendBasicEmail(to, subject, text, settings, html) {
  try {
    await sendEmail({ to, subject, text, html, settings });
  } catch (err) {
    console.error("[email] Gmail API send FAILED:", {
      to,
      subject,
      message: err.message,
      code: err.code,
      details: err?.response?.data,
    });
  }
}

// ---------------- Invoice email (PDF attachment) ----------------
const sendInvoiceEmail = async (invoice, pdfBuffer, settings) => {
  if (!invoice?.guestEmail) return;

  const tmpl = invoiceTemplate({ invoice, settings });
  const fileName = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;

  try {
    await sendEmail({
      to: invoice.guestEmail,
      subject: tmpl.subject,
      text: tmpl.text,
      html: tmpl.html,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
      settings,
    });
  } catch (err) {
    console.error("[email] Gmail API invoice FAILED:", {
      to: invoice.guestEmail,
      subject: tmpl.subject,
      message: err.message,
      code: err.code,
      details: err?.response?.data,
    });
  }
};

// ---------------- Welcome ----------------
async function sendWelcomeEmail(user, settings) {
  if (!user?.email) return;

  const tmpl = welcomeTemplate({ user, settings });
  await sendBasicEmail(user.email, tmpl.subject, tmpl.text, settings, tmpl.html);
}

// ---------------- Login Alert ----------------
async function sendLoginAlertEmail(user, settings) {
  if (!user?.email) return;

  const loginTime = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tmpl = loginAlertTemplate({ user, loginTime, settings });
  await sendBasicEmail(user.email, tmpl.subject, tmpl.text, settings, tmpl.html);
}

// ---------------- Booking Pending ----------------
async function sendBookingPendingEmail(booking, room, settings) {
  if (!booking?.guestEmail) return;

  const tmpl = bookingPendingTemplate({ booking, room, settings });
  await sendBasicEmail(
    booking.guestEmail,
    tmpl.subject,
    tmpl.text,
    settings,
    tmpl.html
  );
}

// ---------------- Booking Confirmed ----------------
async function sendBookingConfirmedEmail(booking, room, settings) {
  if (!booking?.guestEmail) return;

  const tmpl = bookingConfirmedTemplate({ booking, room, settings });
  await sendBasicEmail(
    booking.guestEmail,
    tmpl.subject,
    tmpl.text,
    settings,
    tmpl.html
  );
}

// ---------------- Password Reset Code ----------------
async function sendPasswordResetCodeEmail(user, code, settings) {
  if (!user?.email) return;

  const tmpl = passwordResetCodeTemplate({ user, code, settings });
  await sendBasicEmail(user.email, tmpl.subject, tmpl.text, settings, tmpl.html);
}

module.exports = {
  // low-level
  sendEmail,
  // high-level
  sendInvoiceEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendBookingPendingEmail,
  sendBookingConfirmedEmail,
  sendPasswordResetCodeEmail,
  // optional helper export
  formatDate,
};
