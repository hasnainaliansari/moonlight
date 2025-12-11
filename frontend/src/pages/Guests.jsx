// src/pages/Guests.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  preferences: "",
  notes: "",
  isVIP: false,
};

function Guests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all"); // all | active | inactive
  const [filterVIP, setFilterVIP] = useState("all"); // all | vip | nonvip

  const [guestBookings, setGuestBookings] = useState(null); // { guest, bookings, count }

  const fetchGuests = async (opts = {}) => {
    try {
      setLoading(true);
      const params = {};

      const s = opts.search ?? search;
      const fa = opts.filterActive ?? filterActive;
      const fv = opts.filterVIP ?? filterVIP;

      if (s) params.search = s;
      if (fa === "active") params.isActive = true;
      if (fa === "inactive") params.isActive = false;
      if (fv === "vip") params.isVIP = true;
      if (fv === "nonvip") params.isVIP = false;

      const res = await api.get("/guests", { params });
      setGuests(res.data.guests || []);
    } catch (err) {
      console.error("Load guests error", err);
      setError(err.response?.data?.message || "Failed to load guests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email) {
      setError("Full name and email are required.");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.patch(`/guests/${editingId}`, form);
      } else {
        await api.post("/guests", form);
      }

      resetForm();
      await fetchGuests();
    } catch (err) {
      console.error("Save guest error", err);
      setError(err.response?.data?.message || "Failed to save guest.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (guest) => {
    setEditingId(guest._id);
    setForm({
      fullName: guest.fullName || "",
      email: guest.email || "",
      phone: guest.phone || "",
      address: guest.address || "",
      city: guest.city || "",
      country: guest.country || "",
      preferences: guest.preferences || "",
      notes: guest.notes || "",
      isVIP: !!guest.isVIP,
    });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const toggleActive = async (guest) => {
    try {
      await api.patch(`/guests/${guest._id}`, {
        isActive: !guest.isActive,
      });
      await fetchGuests();
    } catch (err) {
      console.error("Toggle guest active error", err);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await fetchGuests({ search });
  };

  const handleFilterChange = async (type, value) => {
    if (type === "active") setFilterActive(value);
    if (type === "vip") setFilterVIP(value);
    await fetchGuests({
      filterActive: type === "active" ? value : filterActive,
      filterVIP: type === "vip" ? value : filterVIP,
    });
  };

  const loadGuestBookings = async (guest) => {
    try {
      const res = await api.get(`/guests/${guest._id}/bookings`);
      setGuestBookings(res.data);
    } catch (err) {
      console.error("Load guest bookings error", err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Guests</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        Manage guest profiles, preferences and stay history.
      </p>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 8,
            borderRadius: 8,
            background: "#451a1a",
            color: "#fecaca",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Top bar: search + filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            placeholder="Search by name, email, city..."
            style={inputStyle}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" style={smallBtn}>
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <select
            style={inputStyle}
            value={filterActive}
            onChange={(e) => handleFilterChange("active", e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <select
            style={inputStyle}
            value={filterVIP}
            onChange={(e) => handleFilterChange("vip", e.target.value)}
          >
            <option value="all">All guests</option>
            <option value="vip">VIP only</option>
            <option value="nonvip">Non-VIP only</option>
          </select>
        </div>
      </div>

      {/* Create / Edit form */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "#020617",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 16 }}>
            {editingId ? "Edit guest profile" : "Add guest profile"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                ...smallBtn,
                background: "#374151",
                color: "#e5e7eb",
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
          Store contact details, preferences and notes to personalize the
          guest&apos;s future stays.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(180px, 2fr) minmax(200px, 2.5fr) minmax(150px, 1.7fr) minmax(150px, 1.7fr)",
            gap: 10,
          }}
        >
          {/* Row 1 */}
          <div style={fieldCol}>
            <Label>Full name *</Label>
            <input
              style={inputStyle}
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              placeholder="John Doe"
            />
          </div>
          <div style={fieldCol}>
            <Label>Email *</Label>
            <input
              style={inputStyle}
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              type="email"
              placeholder="john@example.com"
            />
          </div>
          <div style={fieldCol}>
            <Label>Phone</Label>
            <input
              style={inputStyle}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+92..."
            />
          </div>
          <div style={fieldCol}>
            <Label>VIP guest</Label>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#e5e7eb",
              }}
            >
              <input
                type="checkbox"
                checked={form.isVIP}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isVIP: e.target.checked }))
                }
              />
              Mark as VIP
            </label>
          </div>

          {/* Row 2 */}
          <div style={fieldCol}>
            <Label>Address</Label>
            <input
              style={inputStyle}
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Street, building..."
            />
          </div>
          <div style={fieldCol}>
            <Label>City</Label>
            <input
              style={inputStyle}
              value={form.city}
              onChange={(e) =>
                setForm((f) => ({ ...f, city: e.target.value }))
              }
            />
          </div>
          <div style={fieldCol}>
            <Label>Country</Label>
            <input
              style={inputStyle}
              value={form.country}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value }))
              }
            />
          </div>
          <div style={{ ...fieldCol, alignSelf: "stretch" }}>
            <Label>Preferences</Label>
            <input
              style={inputStyle}
              value={form.preferences}
              onChange={(e) =>
                setForm((f) => ({ ...f, preferences: e.target.value }))
              }
              placeholder="High floor, non-smoking, etc."
            />
          </div>

          {/* Row 3 – notes full width */}
          <div style={{ gridColumn: "1 / -2", display: "flex", flexDirection: "column" }}>
            <Label>Internal notes</Label>
            <textarea
              style={{
                ...inputStyle,
                minHeight: 60,
                resize: "vertical",
              }}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Special occasions, issues from past stays, etc."
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <button type="submit" style={primaryBtn} disabled={saving}>
              {saving
                ? editingId
                  ? "Saving…"
                  : "Creating…"
                : editingId
                ? "Save changes"
                : "Add guest"}
            </button>
          </div>
        </form>
      </div>

      {/* Guests table */}
      {loading ? (
        <div>Loading guests…</div>
      ) : guests.length === 0 ? (
        <div style={{ fontSize: 13, color: "#9ca3af" }}>
          No guests found. Try adjusting filters or add a new guest.
        </div>
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
              <Th>Guest</Th>
              <Th>Contact</Th>
              <Th>Location</Th>
              <Th>Preferences</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g._id} style={{ borderBottom: "1px solid #111827" }}>
                <Td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{g.fullName}</span>
                    {g.isVIP && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 999,
                          background:
                            "linear-gradient(to right, #facc15, #f97316)",
                          color: "#0f172a",
                          fontWeight: 600,
                        }}
                      >
                        VIP
                      </span>
                    )}
                  </div>
                </Td>
                <Td>
                  <div>{g.email}</div>
                  {g.phone && (
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {g.phone}
                    </div>
                  )}
                </Td>
                <Td>
                  <div>{g.city}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {g.country}
                  </div>
                </Td>
                <Td style={{ maxWidth: 220 }}>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={g.preferences}
                  >
                    {g.preferences || <span style={{ color: "#6b7280" }}>—</span>}
                  </div>
                </Td>
                <Td>
                  <span
                    style={{
                      fontSize: 12,
                      color: g.isActive ? "#4ade80" : "#f97316",
                    }}
                  >
                    {g.isActive ? "Active" : "Inactive"}
                  </span>
                </Td>
                <Td>
                  <button
                    type="button"
                    style={smallBtn}
                    onClick={() => startEdit(g)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{
                      ...smallBtn,
                      marginLeft: 6,
                      background: g.isActive ? "#f97316" : "#22c55e",
                    }}
                    onClick={() => toggleActive(g)}
                  >
                    {g.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    style={{
                      ...smallBtn,
                      marginLeft: 6,
                      background: "#0ea5e9",
                    }}
                    onClick={() => loadGuestBookings(g)}
                  >
                    View stays
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Guest bookings panel */}
      {guestBookings && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.4)",
            background: "#020617",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: 15 }}>
              Stay history — {guestBookings.guest?.fullName} (
              {guestBookings.guest?.email})
            </h3>
            <button
              type="button"
              style={{
                ...smallBtn,
                background: "#374151",
                color: "#e5e7eb",
              }}
              onClick={() => setGuestBookings(null)}
            >
              Close
            </button>
          </div>
          {guestBookings.bookings && guestBookings.bookings.length > 0 ? (
            <table
              style={{
                width: "100%",
                fontSize: 12,
                borderCollapse: "collapse",
                marginTop: 4,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #1f2937" }}>
                  <Th>Room</Th>
                  <Th>Dates</Th>
                  <Th>Guests</Th>
                  <Th>Status</Th>
                  <Th>Total</Th>
                </tr>
              </thead>
              <tbody>
                {guestBookings.bookings.map((b) => (
                  <tr
                    key={b._id}
                    style={{ borderBottom: "1px solid #111827" }}
                  >
                    <Td>
                      {b.room?.roomNumber || "—"}{" "}
                      <span style={{ color: "#9ca3af" }}>
                        ({b.room?.type || "-"})
                      </span>
                    </Td>
                    <Td>
                      {new Date(b.checkInDate).toLocaleDateString()} –{" "}
                      {new Date(b.checkOutDate).toLocaleDateString()}
                    </Td>
                    <Td>{b.numGuests}</Td>
                    <Td style={{ textTransform: "capitalize" }}>{b.status}</Td>
                    <Td>${b.totalPrice}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              No stays found for this guest yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <span style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
      {children}
    </span>
  );
}

const fieldCol = { display: "flex", flexDirection: "column" };

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

export default Guests;
