// src/utils/emailTemplates.js

const HOTEL_NAME = process.env.HOTEL_NAME || "Moonlight Hotel";
const BRAND_NAME = process.env.BRAND_NAME || "Moonlight";
const BRAND_SUB = process.env.BRAND_SUB || "Resort & Suites";
const BRAND_ICON = process.env.BRAND_ICON || "🌙";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.GMAIL_USER || "";

/**
 * Small helpers
 */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(currency, value) {
  const num = Number(value);
  if (Number.isNaN(num)) return `${currency || "USD"} ${value}`;
  return `${currency || "USD"} ${num.toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function preheaderHtml(text) {
  // Preheader trick
  const safe = escapeHtml(text || "");
  return `
    <div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">
      ${safe}
    </div>
  `;
}

/**
 * Layout: cream background, card, rounded, soft shadow, brand header, footer.
 * Inline styles only (email-safe).
 */
function layout({ title, preheader, bodyHtml, settings }) {
  const hotelName = settings?.hotelName || HOTEL_NAME;
  const fromName = settings?.emailFromName || hotelName;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#fdf5ea;">
  ${preheaderHtml(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf5ea;padding:26px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0"
          style="max-width:640px;width:100%;background:#ffffff;border-radius:22px;overflow:hidden;
                 border:1px solid rgba(148,163,184,0.35);box-shadow:0 18px 46px rgba(15,23,42,0.12);">

          <!-- Brand header -->
          <tr>
            <td style="padding:18px 18px 14px;background:#111827;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <span style="font-size:20px;line-height:1;">${escapeHtml(BRAND_ICON)}</span>
                      <div>
                        <div style="font-size:15px;font-weight:700;color:#f9fafb;line-height:1.2;">
                          ${escapeHtml(BRAND_NAME)}
                        </div>
                        <div style="font-size:11px;color:#e5e7eb;letter-spacing:.08em;text-transform:uppercase;">
                          ${escapeHtml(BRAND_SUB)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;padding:6px 12px;border-radius:999px;
                      background:rgba(249,250,251,0.1);border:1px solid rgba(249,250,251,0.25);
                      color:#f9fafb;font-size:11px;letter-spacing:.12em;text-transform:uppercase;">
                      ${escapeHtml(title)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 18px;color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 18px;background:#fefcf6;border-top:1px solid rgba(148,163,184,0.25);
                       font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:12px;color:#4b5563;">
                Need help? Contact us ${SUPPORT_EMAIL ? `at <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#0f766e;text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a>.` : "."}
              </div>
              <div style="margin-top:8px;font-size:11px;color:#6b7280;">
                © ${new Date().getFullYear()} ${escapeHtml(fromName)}. All rights reserved.
              </div>
            </td>
          </tr>

        </table>

        <div style="max-width:640px;margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9ca3af;">
          If you didn’t request this email, you can safely ignore it.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Components
 */
function buttonHtml({ text, href }) {
  // Email-safe button (gradient-ish fallback)
  const safeText = escapeHtml(text);
  const safeHref = escapeHtml(href || "#");
  return `
    <div style="margin:16px 0 6px;">
      <a href="${safeHref}"
         style="display:inline-block;text-decoration:none;border-radius:999px;padding:10px 18px;
                background:linear-gradient(135deg,#22c55e,#facc15);
                color:#022c22;font-weight:700;font-size:13px;
                box-shadow:0 12px 30px rgba(22,163,74,0.25);">
        ${safeText} &nbsp;→
      </a>
    </div>
  `;
}

function pillRowHtml(text) {
  return `
    <div style="margin:0 0 12px;">
      <span style="display:inline-block;padding:6px 14px;border-radius:999px;
                   border:1px solid rgba(148,163,184,0.55);background:#fdf5ea;
                   color:#4b5563;font-size:11px;letter-spacing:.12em;text-transform:uppercase;">
        ${escapeHtml(text)}
      </span>
    </div>
  `;
}

function keyValueRow(label, value) {
  return `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid rgba(148,163,184,0.25);color:#6b7280;font-size:12px;width:38%;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:8px 10px;border-bottom:1px solid rgba(148,163,184,0.25);color:#111827;font-size:12px;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function detailsTableHtml(rows) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="margin-top:10px;border:1px solid rgba(148,163,184,0.35);border-radius:16px;overflow:hidden;background:#ffffff;">
      ${rows.join("")}
    </table>
  `;
}

/**
 * Templates
 */
function welcomeTemplate({ user, settings }) {
  const title = "Welcome";
  const name = user?.name || "Guest";
  const hotelName = settings?.hotelName || HOTEL_NAME;

  const body = `
    ${pillRowHtml("Welcome")}
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Hi ${escapeHtml(name)},</h2>
    <p style="margin:0 0 12px;color:#4b5563;">
      Your account at <b>${escapeHtml(hotelName)}</b> has been created successfully.
    </p>
    <p style="margin:0 0 12px;color:#4b5563;">
      You can now manage bookings, view stay history, and download invoices.
    </p>
    <div style="margin-top:14px;color:#4b5563;">— ${escapeHtml(hotelName)}</div>
  `;

  return {
    subject: `Welcome to ${hotelName}`,
    html: layout({
      title,
      preheader: `Welcome to ${hotelName}`,
      bodyHtml: body,
      settings,
    }),
    text: `Hi ${name},\n\nYour account at ${hotelName} has been created successfully.\n\n— ${hotelName}`,
  };
}

function loginAlertTemplate({ user, loginTime, settings }) {
  const title = "Login Alert";
  const name = user?.name || "Guest";
  const hotelName = settings?.hotelName || HOTEL_NAME;

  const body = `
    ${pillRowHtml("Security")}
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Hello ${escapeHtml(name)},</h2>
    <p style="margin:0 0 12px;color:#4b5563;">
      We detected a new login to your <b>${escapeHtml(hotelName)}</b> account.
    </p>

    ${detailsTableHtml([
      keyValueRow("Time", loginTime || ""),
      keyValueRow("Account", user?.email || ""),
    ])}

    <p style="margin:12px 0 0;color:#4b5563;">
      If this wasn’t you, please reset your password immediately.
    </p>
  `;

  return {
    subject: `New login to your ${hotelName} account`,
    html: layout({
      title,
      preheader: `New login to your ${hotelName} account`,
      bodyHtml: body,
      settings,
    }),
    text: `Hello ${name},\n\nWe detected a new login to your ${hotelName} account.\nTime: ${loginTime}\n\nIf this wasn’t you, please reset your password.\n\n— ${hotelName}`,
  };
}

function passwordResetCodeTemplate({ user, code, settings }) {
  const title = "Reset Code";
  const name = user?.name || "Guest";
  const hotelName = settings?.hotelName || HOTEL_NAME;

  const body = `
    ${pillRowHtml("Password Reset")}
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Hello ${escapeHtml(name)},</h2>
    <p style="margin:0 0 12px;color:#4b5563;">
      Use this one-time code to reset your password:
    </p>

    <div style="display:inline-block;margin:6px 0 14px;padding:12px 16px;border-radius:16px;
                background:#fefce8;border:1px solid rgba(148,163,184,0.35);">
      <div style="font-size:22px;letter-spacing:6px;font-weight:800;color:#111827;">
        ${escapeHtml(code)}
      </div>
    </div>

    <p style="margin:0;color:#6b7280;font-size:12px;">
      This code expires in 10 minutes.
    </p>
  `;

  return {
    subject: `Your ${hotelName} password reset code`,
    html: layout({
      title,
      preheader: `Your reset code is ${code}`,
      bodyHtml: body,
      settings,
    }),
    text: `Hello ${name},\n\nYour one-time reset code is: ${code}\n\nThis code expires in 10 minutes.\n\n— ${hotelName}`,
  };
}

function bookingPendingTemplate({ booking, room, settings }) {
  const title = "Booking Pending";
  const hotelName = settings?.hotelName || HOTEL_NAME;

  const rows = [
    keyValueRow("Room", `${room?.roomNumber || "N/A"}${room?.type ? ` (${room.type})` : ""}`),
    keyValueRow("Check-in", formatDate(booking?.checkInDate)),
    keyValueRow("Check-out", formatDate(booking?.checkOutDate)),
    keyValueRow("Guests", String(booking?.numGuests || 1)),
    keyValueRow("Total", escapeHtml(String(booking?.totalPrice ?? ""))),
  ];

  const body = `
    ${pillRowHtml("Booking")}
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Dear ${escapeHtml(booking?.guestName || "Guest")},</h2>
    <p style="margin:0 0 12px;color:#4b5563;">
      Thank you for choosing <b>${escapeHtml(hotelName)}</b>. We received your booking request and it is currently <b>pending</b>.
    </p>

    ${detailsTableHtml(rows)}

    <p style="margin:12px 0 0;color:#4b5563;">
      Our team will review and confirm it soon. You’ll receive another email once confirmed.
    </p>
  `;

  return {
    subject: `Your booking request is pending – ${hotelName}`,
    html: layout({
      title,
      preheader: `Booking pending at ${hotelName}`,
      bodyHtml: body,
      settings,
    }),
    text: `Dear ${booking?.guestName || "Guest"},\n\nYour booking request at ${hotelName} is pending.\nRoom: ${room?.roomNumber || "N/A"}\nCheck-in: ${formatDate(booking?.checkInDate)}\nCheck-out: ${formatDate(booking?.checkOutDate)}\n\n— ${hotelName}`,
  };
}

function bookingConfirmedTemplate({ booking, room, settings }) {
  const title = "Booking Confirmed";
  const hotelName = settings?.hotelName || HOTEL_NAME;

  const rows = [
    keyValueRow("Room", `${room?.roomNumber || "N/A"}${room?.type ? ` (${room.type})` : ""}`),
    keyValueRow("Check-in", formatDate(booking?.checkInDate)),
    keyValueRow("Check-out", formatDate(booking?.checkOutDate)),
    keyValueRow("Guests", String(booking?.numGuests || 1)),
    keyValueRow("Total", escapeHtml(String(booking?.totalPrice ?? ""))),
  ];

  const body = `
    ${pillRowHtml("Booking")}
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Dear ${escapeHtml(booking?.guestName || "Guest")},</h2>
    <p style="margin:0 0 12px;color:#4b5563;">
      Good news! Your booking at <b>${escapeHtml(hotelName)}</b> has been <b>confirmed</b>.
    </p>

    ${detailsTableHtml(rows)}

    <p style="margin:12px 0 0;color:#4b5563;">
      We look forward to welcoming you. If you need to change or cancel your booking, please contact us.
    </p>
  `;

  return {
    subject: `Your booking is confirmed – ${hotelName}`,
    html: layout({
      title,
      preheader: `Booking confirmed at ${hotelName}`,
      bodyHtml: body,
      settings,
    }),
    text: `Dear ${booking?.guestName || "Guest"},\n\nYour booking at ${hotelName} is confirmed.\nRoom: ${room?.roomNumber || "N/A"}\nCheck-in: ${formatDate(booking?.checkInDate)}\nCheck-out: ${formatDate(booking?.checkOutDate)}\n\n— ${hotelName}`,
  };
}

function invoiceTemplate({ invoice, settings }) {
  const title = "Invoice";
  const hotelName = settings?.hotelName || HOTEL_NAME;

  const currency = invoice?.currencyCode || settings?.currency || "USD";

  const rows = [
    keyValueRow("Invoice #", invoice?.invoiceNumber || String(invoice?._id || "")),
    keyValueRow("Guest", invoice?.guestName || "Guest"),
    keyValueRow("Email", invoice?.guestEmail || ""),
    keyValueRow("Room", String(invoice?.roomNumber || "")),
    keyValueRow("Check-in", formatDate(invoice?.checkInDate)),
    keyValueRow("Check-out", formatDate(invoice?.checkOutDate)),
    keyValueRow("Total", formatMoney(currency, invoice?.totalAmount)),
  ];

  const body = `
    ${pillRowHtml("Billing")}
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Dear ${escapeHtml(invoice?.guestName || "Guest")},</h2>
    <p style="margin:0 0 12px;color:#4b5563;">
      Thank you for staying at <b>${escapeHtml(hotelName)}</b>. Your invoice is attached as a PDF.
    </p>

    ${detailsTableHtml(rows)}

    <p style="margin:12px 0 0;color:#4b5563;">
      If you have any questions about this invoice, reply to this email or contact support.
    </p>
  `;

  return {
    subject: `Your invoice ${invoice?.invoiceNumber || ""} – ${hotelName}`.trim(),
    html: layout({
      title,
      preheader: `Invoice from ${hotelName}`,
      bodyHtml: body,
      settings,
    }),
    text: `Dear ${invoice?.guestName || "Guest"},\n\nAttached is your invoice ${invoice?.invoiceNumber || ""}.\nTotal: ${formatMoney(currency, invoice?.totalAmount)}\n\n— ${hotelName}`,
  };
}

module.exports = {
  welcomeTemplate,
  loginAlertTemplate,
  passwordResetCodeTemplate,
  bookingPendingTemplate,
  bookingConfirmedTemplate,
  invoiceTemplate,
  // export helpers if ever needed
  formatDate,
  formatMoney,
};
