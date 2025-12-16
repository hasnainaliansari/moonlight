// src/pages/Maintenance.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Maintenance() {
  const { user } = useAuth();
  const role = user?.role || "";

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isMaintenance = role === "maintenance";

  // Safety: agar koi aur role direct URL se aa jaye
  const canAccess = isAdmin || isManager || isMaintenance;

  const canCreateTicket = isAdmin || isManager; // page me create form sirf inko
  const canAssign = isAdmin || isManager;

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
  const [pageMsg, setPageMsg] = useState("");

  const statusLabel = useMemo(() => {
    return (s) => s || "—";
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setPageMsg("");

      // ✅ Maintenance staff: only tickets API (backend already returns assigned OR open+unassigned)
      if (isMaintenance) {
        const ticketRes = await api.get("/maintenance/tickets");
        setTickets(ticketRes.data?.tickets || []);
        setRooms([]);
        setStaff([]);
        return;
      }

      // ✅ Admin/Manager: tickets + rooms + maintenance staff list
      const [ticketRes, roomRes, userRes] = await Promise.all([
        api.get("/maintenance/tickets"),
        api.get("/rooms"),
        api.get("/users"),
      ]);

      setTickets(ticketRes.data?.tickets || []);
      setRooms(roomRes.data?.rooms || roomRes.data || []);

      const allUsers = userRes.data?.users || userRes.data || [];
      setStaff(
        allUsers.filter((u) => u.role === "maintenance" && u.isActive !== false)
      );
    } catch (err) {
      console.error("Load maintenance error", err);
      setError(err.response?.data?.message || "Failed to load maintenance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaintenance, canAccess]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreateTicket) return;

    setError("");
    setPageMsg("");

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
        assignedTo: canAssign ? form.assignedToId || null : null,
      });

      setForm({
        roomId: "",
        issue: "",
        priority: "normal",
        assignedToId: "",
      });

      setPageMsg("Ticket created successfully.");
      await loadData();
    } catch (err) {
      console.error("Create maintenance ticket error", err);
      setError(err.response?.data?.message || "Failed to create maintenance ticket.");
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setError("");
      setPageMsg("");

      await api.patch(`/maintenance/tickets/${id}/status`, { status });

      if (status === "in_progress") setPageMsg("Marked as in progress.");
      if (status === "resolved") setPageMsg("Marked as resolved.");

      await loadData();
    } catch (err) {
      console.error("Update maintenance status error", err);
      setError(err.response?.data?.message || "Failed to update ticket status.");
    }
  };

  if (!canAccess) {
    return (
      <div>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Maintenance</h1>
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#451a1a",
            color: "#fecaca",
            fontSize: 13,
          }}
        >
          Access denied.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>
        {isMaintenance ? "My Maintenance Tasks" : "Maintenance"}
      </h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        {isMaintenance
          ? "Work on open issues, start repairs and mark them resolved."
          : "Track issues and repairs. Create tickets and assign maintenance staff."}
      </p>

      {(error || pageMsg) && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 10,
            background: error ? "#451a1a" : "#052e16",
            color: error ? "#fecaca" : "#bbf7d0",
            fontSize: 13,
          }}
        >
          {error || pageMsg}
        </div>
      )}

      {/* ✅ Create ticket form (only admin/manager) */}
      {canCreateTicket && (
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
            <Field label="Room">
              <select
                value={form.roomId}
                onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))}
                placeholder="AC not cooling, TV broken, etc."
                style={inputStyle}
              />
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
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
      )}

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
            {tickets.map((t) => {
              const isGuestRequest = !!t.createdByGuest;

              return (
                <tr key={t._id} style={{ borderBottom: "1px solid #111827" }}>
                  <Td>{t.room?.roomNumber || "—"}</Td>

                  <Td>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{t.issue}</span>
                      {isGuestRequest && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "rgba(56,189,248,0.18)",
                            border: "1px solid rgba(56,189,248,0.35)",
                            color: "#7dd3fc",
                          }}
                        >
                          Guest
                        </span>
                      )}
                    </div>
                  </Td>

                  <Td style={{ textTransform: "capitalize" }}>{t.priority}</Td>

                  <Td>
                    {t.assignedTo?.name
                      ? t.assignedTo.name
                      : "Unassigned"}
                  </Td>

                  <Td style={{ textTransform: "capitalize" }}>
                    {statusLabel(t.status)}
                  </Td>

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
              );
            })}

            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "10px 6px", color: "#9ca3af" }}>
                  No tickets found.
                </td>
              </tr>
            )}
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
