// src/pages/InvoiceDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error("Load invoice detail error", err);
      setError(
        err.response?.data?.message || "Failed to load invoice details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  };

  const currency = invoice?.currencyCode || "USD";

  const formatMoney = (value) => {
    if (value == null) return `${currency} 0.00`;
    if (typeof value !== "number") return `${currency} ${value}`;
    return `${currency} ${value.toFixed(2)}`;
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    try {
      setPaying(true);
      await api.patch(`/invoices/${invoice._id}/pay`, {
        paymentMethod: "cash",
      });
      await loadInvoice();
    } catch (err) {
      console.error("Mark paid (detail) error", err);
      alert("Failed to mark invoice as paid.");
    } finally {
      setPaying(false);
    }
  };

  const openPdf = async () => {
    if (!invoice) return;
    try {
      const response = await api.get(`/invoices/${invoice._id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        alert("Please allow popups to view the PDF.");
      }
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60 * 1000);
    } catch (err) {
      console.error("Open invoice PDF (detail) error", err);
      alert("Failed to open invoice PDF.");
    }
  };

  if (loading) {
    return <div>Loading invoice…</div>;
  }

  if (error) {
    return (
      <div>
        <button
          onClick={() => navigate("/invoices")}
          style={{
            marginBottom: 12,
            fontSize: 12,
            border: "none",
            background: "transparent",
            color: "#9ca3af",
            cursor: "pointer",
          }}
        >
          ← Back to invoices
        </button>
        <div style={{ color: "#fecaca", fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div>
        <button
          onClick={() => navigate("/invoices")}
          style={{
            marginBottom: 12,
            fontSize: 12,
            border: "none",
            background: "transparent",
            color: "#9ca3af",
            cursor: "pointer",
          }}
        >
          ← Back to invoices
        </button>
        <div>Invoice not found.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate("/invoices")}
        style={{
          marginBottom: 12,
          fontSize: 12,
          border: "none",
          background: "transparent",
          color: "#9ca3af",
          cursor: "pointer",
        }}
      >
        ← Back to invoices
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>
            Invoice {invoice.invoiceNumber || "—"}
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>
            Created on {formatDate(invoice.createdAt)} · Booking status:{" "}
            <span style={{ textTransform: "capitalize" }}>
              {invoice.booking?.status || "—"}
            </span>
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              textTransform: "capitalize",
              background:
                invoice.status === "paid"
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(248,250,252,0.05)",
              color:
                invoice.status === "paid" ? "#4ade80" : "rgba(249,250,251,0.9)",
              border:
                invoice.status === "paid"
                  ? "1px solid rgba(34,197,94,0.5)"
                  : "1px solid rgba(148,163,184,0.4)",
            }}
          >
            {invoice.status}
          </span>

          {invoice.paymentMethod && (
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              Payment method: {invoice.paymentMethod}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={openPdf} style={outlineBtn}>
              View PDF
            </button>
            {invoice.status !== "paid" && (
              <button
                onClick={handleMarkPaid}
                disabled={paying}
                style={smallBtn}
              >
                {paying ? "Marking…" : "Mark paid"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top info blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Guest info */}
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(148,163,184,0.3)",
            background: "#020617",
          }}
        >
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>Guest</h2>
          <div style={{ fontSize: 13 }}>
            <div style={{ marginBottom: 4 }}>{invoice.guestName}</div>
            <div style={{ color: "#9ca3af", marginBottom: 4 }}>
              {invoice.guestEmail}
            </div>
            {invoice.booking?.guestPhone && (
              <div style={{ color: "#9ca3af" }}>
                Phone: {invoice.booking.guestPhone}
              </div>
            )}
          </div>
        </div>

        {/* Stay / invoice meta */}
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(148,163,184,0.3)",
            background: "#020617",
          }}
        >
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>Stay & Billing</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 4,
              columnGap: 10,
              fontSize: 13,
            }}
          >
            <div style={{ color: "#9ca3af" }}>Room</div>
            <div>{invoice.roomNumber}</div>

            <div style={{ color: "#9ca3af" }}>Nights</div>
            <div>{invoice.nights}</div>

            <div style={{ color: "#9ca3af" }}>Check-in</div>
            <div>{formatDate(invoice.checkInDate)}</div>

            <div style={{ color: "#9ca3af" }}>Check-out</div>
            <div>{formatDate(invoice.checkOutDate)}</div>

            <div style={{ color: "#9ca3af" }}>Invoice date</div>
            <div>{formatDate(invoice.createdAt)}</div>

            {invoice.paidAt && (
              <>
                <div style={{ color: "#9ca3af" }}>Paid at</div>
                <div>{formatDate(invoice.paidAt)}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Line items table */}
      <div
        style={{
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "#020617",
          marginBottom: 18,
        }}
      >
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>Charges</h2>

        <table
          style={{
            width: "100%",
            fontSize: 13,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #1f2937" }}>
              <Th>Description</Th>
              <Th>Qty</Th>
              <Th>Price</Th>
              <Th>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {/* Room line */}
            <tr style={{ borderBottom: "1px solid #111827" }}>
              <Td>Room {invoice.roomNumber}</Td>
              <Td>{invoice.nights}</Td>
              <Td>{formatMoney(invoice.roomRate)}</Td>
              <Td>{formatMoney(invoice.baseAmount)}</Td>
            </tr>

            {/* Extras */}
            {Array.isArray(invoice.extraCharges) &&
              invoice.extraCharges.map((extra, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid #111827" }}
                >
                  <Td>{extra.description}</Td>
                  <Td>1</Td>
                  <Td>{formatMoney(extra.amount)}</Td>
                  <Td>{formatMoney(extra.amount)}</Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            minWidth: 260,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.3)",
            background: "#020617",
            fontSize: 13,
          }}
        >
          {typeof invoice.subTotal === "number" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ color: "#9ca3af" }}>Subtotal</span>
              <span>{formatMoney(invoice.subTotal)}</span>
            </div>
          )}

          {invoice.taxRate && invoice.taxRate > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ color: "#9ca3af" }}>
                Tax ({invoice.taxRate}%)
              </span>
              <span>{formatMoney(invoice.taxAmount || 0)}</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              paddingTop: 6,
              borderTop: "1px solid #1f2937",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>Total</span>
            <span>{formatMoney(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const smallBtn = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "none",
  background: "#22c55e",
  color: "#0f172a",
  fontSize: 12,
  cursor: "pointer",
};

const outlineBtn = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #4b5563",
  background: "transparent",
  color: "#e5e7eb",
  fontSize: 12,
  cursor: "pointer",
};

function Th({ children }) {
  return (
    <th style={{ padding: "8px 6px", textAlign: "left", fontWeight: 500 }}>
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td style={{ padding: "6px 6px" }}>{children}</td>;
}

export default InvoiceDetail;
