// src/pages/Invoices.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 NEW
import api from "../services/api";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    bookingId: "",
    extraDescription: "",
    extraAmount: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate(); // 👈 NEW

  const loadData = async () => {
    try {
      setLoading(true);

      const [invRes, candidateRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/invoices/candidates"),
      ]);

      setInvoices(invRes.data.invoices || invRes.data);

      const candidateBookings =
        candidateRes.data.bookings || candidateRes.data || [];
      setBookings(candidateBookings);
    } catch (err) {
      console.error("Load invoices error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.bookingId) {
      setError("Please select a booking.");
      return;
    }

    try {
      setCreating(true);

      const extraCharges =
        form.extraDescription && form.extraAmount
          ? [
              {
                description: form.extraDescription,
                amount: Number(form.extraAmount) || 0,
              },
            ]
          : [];

      await api.post(`/invoices/from-booking/${form.bookingId}`, {
        extraCharges,
      });

      setForm({
        bookingId: "",
        extraDescription: "",
        extraAmount: "",
      });

      await loadData();
    } catch (err) {
      console.error("Create invoice error", err);
      setError(
        err.response?.data?.message || "Failed to create invoice from booking."
      );
    } finally {
      setCreating(false);
    }
  };

  const markPaid = async (id) => {
    try {
      await api.patch(`/invoices/${id}/pay`, { paymentMethod: "cash" });
      await loadData();
    } catch (err) {
      console.error("Mark paid error", err);
    }
  };

  // Open PDF in a new browser tab
  const openPdf = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
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
      console.error("Open invoice PDF error", err);
      alert("Failed to open invoice PDF.");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Invoices</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        View and manage guest invoices.
      </p>

      {/* Create from booking */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "#020617",
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>
          Generate invoice from booking
        </h2>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
          Select a booking and optionally add one extra charge (e.g. airport
          pickup, room service).
        </p>

        {error && (
          <div
            style={{
              marginBottom: 8,
              fontSize: 13,
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 2fr) minmax(180px, 2fr) minmax(120px, 1fr) auto",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}
            >
              Booking
            </label>
            <select
              value={form.bookingId}
              onChange={(e) =>
                setForm((f) => ({ ...f, bookingId: e.target.value }))
              }
              style={inputStyle}
            >
              <option value="">Select booking…</option>
              {bookings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.guestName} — room {b.room?.roomNumber || "?"} (
                  {new Date(b.checkInDate).toLocaleDateString()}–
                  {new Date(b.checkOutDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}
            >
              Extra charge description (optional)
            </label>
            <input
              value={form.extraDescription}
              onChange={(e) =>
                setForm((f) => ({ ...f, extraDescription: e.target.value }))
              }
              placeholder="Airport pickup, minibar, etc."
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}
            >
              Extra amount
            </label>
            <input
              type="number"
              min="0"
              value={form.extraAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, extraAmount: e.target.value }))
              }
              placeholder="0"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={creating} style={primaryBtn}>
            {creating ? "Creating…" : "Create invoice"}
          </button>
        </form>

        {bookings.length === 0 && (
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
            All eligible bookings already have invoices. 🎉
          </p>
        )}
      </div>

      {/* Invoice list */}
      {loading ? (
        <div>Loading invoices…</div>
      ) : (
        <table
          style={{
            width: "100%",
            fontSize: 13,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #1f2937" }}>
              <Th>Invoice</Th>
              <Th>Guest</Th>
              <Th>Room</Th>
              <Th>Dates</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Payment</Th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} style={{ borderBottom: "1px solid #111827" }}>
                <Td>
                  <div style={{ fontWeight: 500 }}>
                    {inv.invoiceNumber || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {inv.booking?.status || ""}
                  </div>
                </Td>
                <Td>
                  <div>{inv.guestName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {inv.guestEmail}
                  </div>
                </Td>
                <Td>{inv.roomNumber}</Td>
                <Td>
                  {inv.checkInDate &&
                    new Date(inv.checkInDate).toLocaleDateString()}{" "}
                  –{" "}
                  {inv.checkOutDate &&
                    new Date(inv.checkOutDate).toLocaleDateString()}
                </Td>
                <Td>
                  {(inv.currencyCode || "USD") + " "}
                  {typeof inv.totalAmount === "number"
                    ? inv.totalAmount.toFixed(2)
                    : inv.totalAmount}
                </Td>
                <Td style={{ textTransform: "capitalize" }}>{inv.status}</Td>
                <Td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {/* Go to detail page */}
                    <button
                      onClick={() => navigate(`/invoices/${inv._id}`)}
                      style={outlineBtn}
                    >
                      Details
                    </button>

                    <button onClick={() => openPdf(inv._id)} style={outlineBtn}>
                      View PDF
                    </button>

                    {inv.status === "paid" ? (
                      <span style={{ color: "#4ade80", fontSize: 12 }}>
                        Paid {inv.paymentMethod && `(${inv.paymentMethod})`}
                      </span>
                    ) : (
                      <button
                        onClick={() => markPaid(inv._id)}
                        style={smallBtn}
                      >
                        Mark paid
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.4)",
  background: "#020617",
  color: "#e5e7eb",
  outline: "none",
  fontSize: 13,
};

const primaryBtn = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(to right, #22c55e, #22d3ee, #6366f1)",
  color: "#0f172a",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const smallBtn = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "none",
  background: "#22c55e",
  color: "#0f172a",
  fontSize: 11,
  cursor: "pointer",
};

const outlineBtn = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #4b5563",
  background: "transparent",
  color: "#e5e7eb",
  fontSize: 11,
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

export default Invoices;
