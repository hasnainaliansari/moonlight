// src/utils/email.js
const { google } = require("googleapis");
const MailComposer = require("nodemailer/lib/mail-composer");

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
    throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI");
  }

  const oAuth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  if (!process.env.GMAIL_REFRESH_TOKEN) {
    throw new Error("Missing GMAIL_REFRESH_TOKEN");
  }

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

async function sendEmail({ to, subject, text, attachments, settings }) {
  if (!to) return;

  const gmail = await getGmailService();

  const mail = new MailComposer({
    from: getFrom(settings),
    to,
    subject,
    text,
    attachments, // [{ filename, content, contentType }]
  });

  const mime = await mail.compile().build();
  const raw = base64UrlEncode(mime);

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  console.log("[email] Sent (Gmail API):", subject, "→", to);
}

async function sendBasicEmail(to, subject, text, settings) {
  try {
    await sendEmail({ to, subject, text, settings });
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

  const hotelName = settings?.hotelName || HOTEL_NAME;
  const subject = `Your invoice ${invoice.invoiceNumber || ""} – ${hotelName}`;

  const textBody = `
Dear ${invoice.guestName || "Guest"},

Thank you for staying at ${hotelName}.
Attached is your invoice ${invoice.invoiceNumber || ""} for your recent stay.

Total amount: ${invoice.currencyCode || "USD"} ${invoice.totalAmount}

Best regards,
${hotelName}
`.trim();

  const fileName = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;

  try {
    await sendEmail({
      to: invoice.guestEmail,
      subject,
      text: textBody,
      attachments: [
        { filename: fileName, content: pdfBuffer, contentType: "application/pdf" },
      ],
      settings,
    });
  } catch (err) {
    console.error("[email] Gmail API invoice FAILED:", {
      to: invoice.guestEmail,
      subject,
      message: err.message,
      code: err.code,
      details: err?.response?.data,
    });
  }
};

// ---------------- Other existing functions (same names) ----------------
async function sendWelcomeEmail(user) {
  if (!user?.email) return;

  const subject = `Welcome to ${HOTEL_NAME}`;
  const text = `Dear ${user.name || "Guest"},

Your account at ${HOTEL_NAME} has been created successfully.

Warm regards,
${HOTEL_NAME}
`;

  await sendBasicEmail(user.email, subject, text);
}

async function sendLoginAlertEmail(user) {
  if (!user?.email) return;

  const subject = `New login to your ${HOTEL_NAME} account`;
  const text = `Hello ${user.name || "Guest"},

We detected a new login to your ${HOTEL_NAME} account.

Thank you,
${HOTEL_NAME}
`;

  await sendBasicEmail(user.email, subject, text);
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function sendBookingPendingEmail(booking, room) {
  if (!booking?.guestEmail) return;

  const subject = `Your booking request is pending – ${HOTEL_NAME}`;
  const text = `Dear ${booking.guestName || "Guest"},

Status: PENDING

Room: ${room?.roomNumber || "N/A"} ${room?.type ? `(${room.type})` : ""}
Check-in: ${formatDate(booking.checkInDate)}
Check-out: ${formatDate(booking.checkOutDate)}

Warm regards,
${HOTEL_NAME}
`;

  await sendBasicEmail(booking.guestEmail, subject, text);
}

async function sendBookingConfirmedEmail(booking, room) {
  if (!booking?.guestEmail) return;

  const subject = `Your booking is confirmed – ${HOTEL_NAME}`;
  const text = `Dear ${booking.guestName || "Guest"},

Status: CONFIRMED

Room: ${room?.roomNumber || "N/A"} ${room?.type ? `(${room.type})` : ""}
Check-in: ${formatDate(booking.checkInDate)}
Check-out: ${formatDate(booking.checkOutDate)}

See you soon,
${HOTEL_NAME}
`;

  await sendBasicEmail(booking.guestEmail, subject, text);
}

async function sendPasswordResetCodeEmail(user, code) {
  if (!user?.email) return;

  const subject = `Your ${HOTEL_NAME} password reset code`;
  const text = `Hello ${user.name || "Guest"},

Your one-time reset code is:

${code}

This code will expire in 15 minutes.

Thank you,
${HOTEL_NAME}
`;

  await sendBasicEmail(user.email, subject, text);
}

module.exports = {
  sendInvoiceEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendBookingPendingEmail,
  sendBookingConfirmedEmail,
  sendPasswordResetCodeEmail,
};
