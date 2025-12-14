// src/utils/email.js
const nodemailer = require("nodemailer");

// --------------------------------------------------
//  SMTP / Gmail transporter
// --------------------------------------------------
//
// Uses:
//  SMTP_HOST=smtp.gmail.com
//  SMTP_PORT=587
//  SMTP_USER=your_gmail@gmail.com
//  SMTP_PASS=app_password
//  SMTP_FROM="Moonlight Hotel <your_gmail@gmail.com>"
// --------------------------------------------------

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // SSL on 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
  logger: true,
  debug: true,
});

// App start par ek quick verify (non-blocking)
// Sirf log karega; app crash nahi karega.
transporter
  .verify()
  .then(() => {
    console.log("[email] SMTP connection OK (Gmail)");
  })
  .catch((err) => {
    console.error("[email] SMTP verify FAILED:", {
      message: err.message,
      code: err.code,
      command: err.command,
    });
  });

const HOTEL_NAME = process.env.HOTEL_NAME || "Moonlight Hotel";

// --------------------------------------------------
//  Helper: default FROM address
// --------------------------------------------------
function getFromAddress() {
  // e.g. "Moonlight Hotel <hasnainaliansari221@gmail.com>"
  return (
    process.env.SMTP_FROM ||
    `${HOTEL_NAME} <${process.env.SMTP_USER || "no-reply@example.com"}>`
  );
}

// --------------------------------------------------
//  Helper: basic text email
// --------------------------------------------------
async function sendBasicEmail(to, subject, text) {
  if (!to) return;

  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("[email] Sent:", subject, "→", to);
  } catch (err) {
    console.error("[email] Failed to send:", {
      to,
      subject,
      message: err.message,
      code: err.code,
      command: err.command,
    });
  }
}

// --------------------------------------------------
//  Invoice email with PDF attachment
// --------------------------------------------------
const sendInvoiceEmail = async (invoice, pdfBuffer, settings) => {
  if (!invoice?.guestEmail) return;

  const hotelName = settings?.hotelName || HOTEL_NAME;
  const fromName =
    settings?.emailFromName || hotelName || process.env.EMAIL_FROM_NAME;
  const fromAddress =
    settings?.hotelEmail || process.env.SMTP_USER || "no-reply@example.com";

  const subject = `Your invoice ${invoice.invoiceNumber || ""} – ${hotelName}`;

  const textBody = `
Dear ${invoice.guestName || "Guest"},

Thank you for staying at ${hotelName}.
Attached is your invoice ${invoice.invoiceNumber || ""} for your recent stay.

Total amount: ${invoice.currencyCode || "USD"} ${invoice.totalAmount}

If you have any questions, feel free to reply to this email.

Best regards,
${hotelName}
`.trim();

  const fileName = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: invoice.guestEmail,
    subject,
    text: textBody,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("[email] Invoice sent:", subject, "→", invoice.guestEmail);
  } catch (err) {
    console.error("[email] Failed to send invoice:", {
      to: invoice.guestEmail,
      subject,
      message: err.message,
      code: err.code,
      command: err.command,
    });
  }
};

// --------------------------------------------------
//  AUTH EMAILS
// --------------------------------------------------
async function sendWelcomeEmail(user) {
  if (!user?.email) return;

  const subject = `Welcome to ${HOTEL_NAME}`;
  const text = `Dear ${user.name || "Guest"},

Your account at ${HOTEL_NAME} has been created successfully with this email address.

You can now sign in to:
- View and manage your bookings
- Check upcoming stays
- Download invoices

If you did not create this account, please contact our team immediately.

Warm regards,
${HOTEL_NAME}
`;

  await sendBasicEmail(user.email, subject, text);
}

async function sendLoginAlertEmail(user) {
  if (!user?.email) return;

  const loginTime = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `New login to your ${HOTEL_NAME} account`;
  const text = `Hello ${user.name || "Guest"},

We detected a new login to your ${HOTEL_NAME} account.

Time: ${loginTime}

If this was you, no action is needed.
If you did NOT perform this login, please reset your password or contact our team.

Thank you,
${HOTEL_NAME}
`;

  await sendBasicEmail(user.email, subject, text);
}

// --------------------------------------------------
//  BOOKING EMAILS
// --------------------------------------------------
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

Thank you for choosing ${HOTEL_NAME}.

We have received your booking request and it is currently in PENDING status.

Booking details:
- Room: ${room?.roomNumber || "N/A"} ${
    room?.type ? `(${room.type})` : ""
  }
- Check-in: ${formatDate(booking.checkInDate)}
- Check-out: ${formatDate(booking.checkOutDate)}
- Guests: ${booking.numGuests || 1}
- Total: $${booking.totalPrice}

Our team will review your request and confirm it as soon as possible.
You will receive another email when your booking is confirmed.

Warm regards,
${HOTEL_NAME}
`;

  await sendBasicEmail(booking.guestEmail, subject, text);
}

async function sendBookingConfirmedEmail(booking, room) {
  if (!booking?.guestEmail) return;

  const subject = `Your booking is confirmed – ${HOTEL_NAME}`;
  const text = `Dear ${booking.guestName || "Guest"},

Good news! Your booking at ${HOTEL_NAME} has been CONFIRMED.

Booking details:
- Room: ${room?.roomNumber || "N/A"} ${
    room?.type ? `(${room.type})` : ""
  }
- Check-in: ${formatDate(booking.checkInDate)}
- Check-out: ${formatDate(booking.checkOutDate)}
- Guests: ${booking.numGuests || 1}
- Total: $${booking.totalPrice}

We look forward to welcoming you.

If you need to change or cancel your booking, please contact us and mention your booking dates and room number.

See you soon,
${HOTEL_NAME}
`;

  await sendBasicEmail(booking.guestEmail, subject, text);
}

// --------------------------------------------------
//  PASSWORD RESET EMAIL
// --------------------------------------------------
async function sendPasswordResetCodeEmail(user, code) {
  if (!user?.email) return;

  const subject = `Your ${HOTEL_NAME} password reset code`;
  const text = `Hello ${user.name || "Guest"},

You requested to reset the password for your ${HOTEL_NAME} account.

Your one-time reset code is:

${code}

This code will expire in 15 minutes. If you did not request this, you can safely ignore this email and your password will remain unchanged.

Thank you,
${HOTEL_NAME}
`;

  await sendBasicEmail(user.email, subject, text);
}

module.exports = {
  transporter, // optional – useful for future debug routes
  sendInvoiceEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendBookingPendingEmail,
  sendBookingConfirmedEmail,
  sendPasswordResetCodeEmail,
};
