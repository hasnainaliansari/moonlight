// src/pages/Housekeeping.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Housekeeping() {
  const { user } = useAuth();
  const role = user?.role || "";

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isReceptionist = role === "receptionist";
  const isHousekeeping = role === "housekeeping";

  const canAccess = isAdmin || isManager || isHousekeeping || isReceptionist;
  const canCreateTask = isAdmin || isManager || isReceptionist; // admin/manager/receptionist create

  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    roomId: "",
    description: "",
    assignedToId: "",
  });

  const [error, setError] = useState("");
  const [pageMsg, setPageMsg] = useState("");

  const prettyStatus = useMemo(() => {
    return (s) => {
      // UI mapping for housekeeping brief
      if (s === "pending") return "needs_cleaning";
      if (s === "in_progress") return "in_progress";
      if (s === "done") return "done";
      return s || "—";
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setPageMsg("");

      // ✅ Housekeeping staff: only their tasks (secure backend filter too)
      if (isHousekeeping) {
        const res = await api.get("/housekeeping/tasks");
        setTasks(res.data?.tasks || []);
        setRooms([]);
        setStaff([]);
        return;
      }

      // ✅ Admin/Manager/Receptionist: all tasks + rooms + staff list (for create/assign)
      const calls = [api.get("/housekeeping/tasks")];

      // Only fetch rooms/users if they can create tasks (avoid extra calls)
      if (canCreateTask) {
        calls.push(api.get("/rooms"));
        calls.push(api.get("/users"));
      }

      const [taskRes, roomRes, userRes] = await Promise.all(calls);

      setTasks(taskRes.data?.tasks || taskRes.data || []);

      if (roomRes) setRooms(roomRes.data?.rooms || roomRes.data || []);

      if (userRes) {
        const allUsers = userRes.data?.users || userRes.data || [];
        setStaff(
          allUsers.filter((u) => u.role === "housekeeping" && u.isActive !== false)
        );
      } else {
        setStaff([]);
      }
    } catch (err) {
      console.error("Load housekeeping error", err);
      setError(err.response?.data?.message || "Failed to load housekeeping data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHousekeeping, canAccess]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreateTask) return;

    setError("");
    setPageMsg("");

    if (!form.roomId || !form.description) {
      setError("Room and description are required.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/housekeeping/tasks", {
        roomId: form.roomId,
        description: form.description,
        assignedTo: form.assignedToId || null,
      });

      setForm({ roomId: "", description: "", assignedToId: "" });
      setPageMsg("Task created successfully.");
      await loadData();
    } catch (err) {
      console.error("Create housekeeping task error", err);
      setError(err.response?.data?.message || "Failed to create housekeeping task.");
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setError("");
      setPageMsg("");

      await api.patch(`/housekeeping/tasks/${id}/status`, { status });

      if (status === "in_progress") setPageMsg("Marked as in progress.");
      if (status === "done") setPageMsg("Marked as done (room set to available).");

      await loadData();
    } catch (err) {
      console.error("Update housekeeping status error", err);
      setError(err.response?.data?.message || "Failed to update task status.");
    }
  };

  if (!canAccess) {
    return (
      <div>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Housekeeping</h1>
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
        {isHousekeeping ? "My Housekeeping Tasks" : "Housekeeping"}
      </h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        {isHousekeeping
          ? "View your assigned rooms, start cleaning and mark tasks done."
          : "Create and manage housekeeping tasks and room availability."}
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

      {/* ✅ Create task form (admin/manager/receptionist only) */}
      {canCreateTask && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.3)",
            background: "#020617",
          }}
        >
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Create task</h2>

          <form
            onSubmit={handleCreate}
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(140px, 1fr) minmax(220px, 2fr) minmax(180px, 1.5fr) auto",
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

            <Field label="Description / task">
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Change linens, deep clean, etc."
                style={inputStyle}
              />
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
              {creating ? "Saving…" : "Add task"}
            </button>
          </form>
        </div>
      )}

      {/* ✅ Role-based table */}
      {loading ? (
        <div>Loading tasks…</div>
      ) : (
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1f2937" }}>
              <Th>Room #</Th>
              <Th>Tasks / notes</Th>
              {!isHousekeeping && <Th>Assigned to</Th>}
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((t) => (
              <tr key={t._id} style={{ borderBottom: "1px solid #111827" }}>
                <Td>{t.room?.roomNumber || "—"}</Td>

                <Td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div>{t.description || "—"}</div>
                    {t.notes ? (
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>
                        Notes: {t.notes}
                      </div>
                    ) : null}
                  </div>
                </Td>

                {!isHousekeeping && <Td>{t.assignedTo?.name || "Unassigned"}</Td>}

                <Td style={{ textTransform: "capitalize" }}>
                  {prettyStatus(t.status)}
                </Td>

                <Td>
                  {t.status !== "in_progress" && t.status !== "done" && (
                    <button
                      onClick={() => updateStatus(t._id, "in_progress")}
                      style={smallBtn}
                    >
                      Start cleaning
                    </button>
                  )}{" "}
                  {t.status !== "done" && (
                    <button
                      onClick={() => updateStatus(t._id, "done")}
                      style={smallBtn}
                    >
                      Mark as done
                    </button>
                  )}
                </Td>
              </tr>
            ))}

            {tasks.length === 0 && (
              <tr>
                <td colSpan={isHousekeeping ? 4 : 5} style={{ padding: "10px 6px", color: "#9ca3af" }}>
                  No tasks found.
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

export default Housekeeping;
