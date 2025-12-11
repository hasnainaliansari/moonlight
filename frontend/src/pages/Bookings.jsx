// src/pages/Bookings.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function Bookings() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    roomId: "",
    checkInDate: "",
    checkOutDate: "",
    numGuests: 1,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get("/rooms"),
        api.get("/bookings"),
      ]);

      setRooms(roomsRes.data.rooms || roomsRes.data);
      setBookings(bookingsRes.data.bookings || bookingsRes.data);
      setError("");
    } catch (err) {
      console.error("Load bookings error:", err);
      setError(
        err?.response?.data?.message || "Failed to load bookings from server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.post("/bookings", {
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        roomId: form.roomId,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        numGuests: Number(form.numGuests) || 1,
      });

      setForm({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        roomId: "",
        checkInDate: "",
        checkOutDate: "",
        numGuests: 1,
      });

      await loadData();
    } catch (err) {
      console.error("Create booking error:", err);
      setError(
        err?.response?.data?.message || "Failed to create booking. Try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/bookings/${id}/confirm`);
      await loadData();
    } catch (err) {
      console.error("Confirm booking error:", err);
      alert(
        err?.response?.data?.message || "Failed to confirm booking. Try again."
      );
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await api.patch(`/bookings/${id}/checkin`);
      await loadData();
    } catch (err) {
      console.error("Check-in booking error:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to check in booking. Try again."
      );
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await api.patch(`/bookings/${id}/checkout`);
      await loadData();
    } catch (err) {
      console.error("Check-out booking error:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to check out booking. Try again."
      );
    }
  };

  const findRoomLabel = (booking) => {
    const r = booking.room;
    if (!r) return "";
    const typeLabel =
      r.type?.charAt(0).toUpperCase() + r.type?.slice(1) || "";
    return `${r.roomNumber} (${typeLabel})`;
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Bookings</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 14 }}>
        Create and manage guest bookings.
      </p>

      {/* NEW BOOKING CARD */}
      <div
        style={{
          marginBottom: 20,
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.35)",
          background: "#020617",
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>New booking</h2>
        {error && (
          <div
            style={{
              marginBottom: 10,
              padding: 8,
              borderRadius: 8,
              fontSize: 13,
              background: "rgba(239,68,68,0.12)",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <Field label="Guest name">
            <input
              name="guestName"
              value={form.guestName}
              onChange={handleChange}
            />
          </Field>
          <Field label="Guest email">
            <input
              name="guestEmail"
              value={form.guestEmail}
              onChange={handleChange}
            />
          </Field>
          <Field label="Guest phone">
            <input
              name="guestPhone"
              value={form.guestPhone}
              onChange={handleChange}
            />
          </Field>
          <Field label="Room">
            <select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
            >
              <option value="">Select room</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} ({r.type})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Check-in date">
            <input
              type="date"
              name="checkInDate"
              value={form.checkInDate}
              onChange={handleChange}
            />
          </Field>
          <Field label="Check-out date">
            <input
              type="date"
              name="checkOutDate"
              value={form.checkOutDate}
              onChange={handleChange}
            />
          </Field>
          <Field label="Guests">
            <input
              type="number"
              name="numGuests"
              min={1}
              value={form.numGuests}
              onChange={handleChange}
            />
          </Field>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginTop: 12,
            }}
          >
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(to right, #22c55e, #22d3ee, #6366f1)",
                color: "#0f172a",
                fontWeight: 600,
                cursor: creating ? "wait" : "pointer",
              }}
            >
              {creating ? "Creating..." : "Create booking"}
            </button>
          </div>
        </form>
      </div>

      {/* BOOKINGS TABLE */}
      {loading ? (
        <div style={{ fontSize: 13, color: "#9ca3af" }}>Loading bookings…</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "1px solid #111827",
              }}
            >
              <th style={{ padding: "8px 6px" }}>Guest</th>
              <th style={{ padding: "8px 6px" }}>Room</th>
              <th style={{ padding: "8px 6px" }}>Dates</th>
              <th style={{ padding: "8px 6px" }}>Guests</th>
              <th style={{ padding: "8px 6px" }}>Status</th>
              <th style={{ padding: "8px 6px" }}>Total</th>
              <th style={{ padding: "8px 6px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b._id}
                style={{
                  borderBottom: "1px solid #020617",
                }}
              >
                <td style={{ padding: "8px 6px" }}>
                  <div>{b.guestName}</div>
                  <div
                    style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}
                  >
                    {b.guestEmail}
                  </div>
                </td>
                <td style={{ padding: "8px 6px" }}>{findRoomLabel(b)}</td>
                <td style={{ padding: "8px 6px" }}>
                  {formatDate(b.checkInDate)} — {formatDate(b.checkOutDate)}
                </td>
                <td style={{ padding: "8px 6px" }}>{b.numGuests}</td>
                <td
                  style={{
                    padding: "8px 6px",
                    textTransform: "capitalize",
                  }}
                >
                  {b.status}
                </td>
                <td style={{ padding: "8px 6px" }}>
                  ${b.totalPrice?.toFixed ? b.totalPrice.toFixed(0) : b.totalPrice}
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <ActionsCell
                    booking={b}
                    onConfirm={handleConfirm}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Field({ label, children }) {
  const child = children;
  const isInputLike =
    child &&
    (child.type === "input" ||
      child.type === "select" ||
      child.type === "textarea");

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: 12,
          color: "#9ca3af",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {isInputLike
        ? {
            ...child,
            props: {
              ...child.props,
              style: {
                width: "100%",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.4)",
                background: "#020617",
                color: "#e5e7eb",
                outline: "none",
                ...(child.props.style || {}),
              },
            },
          }
        : child}
    </div>
  );
}

function ActionsCell({ booking, onConfirm, onCheckIn, onCheckOut }) {
  const baseStyle = {
    padding: "4px 10px",
    borderRadius: 999,
    border: "none",
    fontSize: 12,
    cursor: "pointer",
  };

  if (booking.status === "pending") {
    return (
      <button
        style={{
          ...baseStyle,
          background: "#22c55e",
          color: "#022c22",
        }}
        onClick={() => onConfirm(booking._id)}
      >
        Confirm
      </button>
    );
  }

  if (booking.status === "confirmed") {
    return (
      <button
        style={{
          ...baseStyle,
          background: "#22c55e",
          color: "#022c22",
        }}
        onClick={() => onCheckIn(booking._id)}
      >
        Check in
      </button>
    );
  }

  if (booking.status === "checked_in") {
    return (
      <button
        style={{
          ...baseStyle,
          background: "#60a5fa",
          color: "#0b1120",
        }}
        onClick={() => onCheckOut(booking._id)}
      >
        Check out
      </button>
    );
  }

  // checked_out / cancelled
  return (
    <span style={{ fontSize: 12, color: "#6b7280" }}>
      No actions
    </span>
  );
}

export default Bookings;
