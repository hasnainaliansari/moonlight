// src/pages/Maintenance.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    roomId: "",
    issue: "",
    priority: "normal",
    assignedToId: "",
  });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [ticketRes, roomRes, userRes] = await Promise.all([
        api.get("/maintenance/tickets"),
        api.get("/rooms"),
        api.get("/users"),
      ]);

      setTickets(ticketRes.data.tickets || ticketRes.data);
      setRooms(roomRes.data.rooms || roomRes.data);

      const allUsers = userRes.data.users || userRes.data;
      setStaff(
        allUsers.filter(
          (u) => u.role === "maintenance" && u.isActive !== false
        )
      );
    } catch (err) {
      console.error("Load maintenance error", err);
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

    if (!form.roomId || !form.issue) {
      setError("Room and issue are required.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/maintenance/tickets", {
        roomId: form.roomId,
        issue: form.issue,
        priority: form.priority,
        assignedTo: form.assignedToId || null,
      });

      setForm({
        roomId: "",
        issue: "",
        priority: "normal",
        assignedToId: "",
      });

      await loadData();
    } catch (err) {
      console.error("Create maintenance ticket error", err);
      setError(
        err.response?.data?.message || "Failed to create maintenance ticket."
      );
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/maintenance/tickets/${id}/status`, { status });
      await loadData();
    } catch (err) {
      console.error("Update maintenance status error", err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Maintenance</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        Track issues and repairs.
      </p>

      {/* New ticket form */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "#020617",
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>New ticket</h2>

        <form
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(140px, 1fr) minmax(220px, 2.2fr) minmax(120px, 1fr) minmax(200px, 1.6fr) auto",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          {error && (
            <div
              style={{
                gridColumn: "1 / -1",
                fontSize: 13,
                color: "#fecaca",
              }}
            >
              {error}
            </div>
          )}

          <Field label="Room">
            <select
              value={form.roomId}
              onChange={(e) =>
                setForm((f) => ({ ...f, roomId: e.target.value }))
              }
              style={inputStyle}
            >
              <option value="">Select room…</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber} — {r.type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Issue">
            <input
              value={form.issue}
              onChange={(e) =>
                setForm((f) => ({ ...f, issue: e.target.value }))
              }
              placeholder="AC not cooling, TV broken, etc."
              style={inputStyle}
            />
          </Field>

          <Field label="Priority">
            <select
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: e.target.value }))
              }
              style={inputStyle}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </Field>

          <Field label="Assign to (optional)">
            <select
              value={form.assignedToId}
              onChange={(e) =>
                setForm((f) => ({ ...f, assignedToId: e.target.value }))
              }
              style={inputStyle}
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </Field>

          <button type="submit" disabled={creating} style={primaryBtn}>
            {creating ? "Saving…" : "Create ticket"}
          </button>
        </form>
      </div>

      {/* Tickets table */}
      {loading ? (
        <div>Loading tickets…</div>
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
              <Th>Room</Th>
              <Th>Issue</Th>
              <Th>Priority</Th>
              <Th>Assigned to</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id} style={{ borderBottom: "1px solid #111827" }}>
                <Td>{t.room?.roomNumber || "—"}</Td>
                <Td>{t.issue}</Td>
                <Td style={{ textTransform: "capitalize" }}>{t.priority}</Td>
                <Td>{t.assignedTo?.name || "Unassigned"}</Td>
                <Td style={{ textTransform: "capitalize" }}>{t.status}</Td>
                <Td>
                  {t.status !== "in_progress" && t.status !== "resolved" && (
                    <button
                      onClick={() => updateStatus(t._id, "in_progress")}
                      style={smallBtn}
                    >
                      Start
                    </button>
                  )}{" "}
                  {t.status !== "resolved" && (
                    <button
                      onClick={() => updateStatus(t._id, "resolved")}
                      style={smallBtn}
                    >
                      Resolve
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
        {label}
      </label>
      {children}
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

export default Maintenance;
