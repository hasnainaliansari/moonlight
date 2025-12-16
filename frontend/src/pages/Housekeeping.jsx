import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Housekeeping() {
  const { user } = useAuth();
  const role = user?.role || "";

  const isHousekeeping = role === "housekeeping";
  const isAdminOrManager = role === "admin" || role === "manager";

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

  const tasksEndpoint = useMemo(() => {
    // housekeeping staff should only see their tasks
    return isHousekeeping ? "/housekeeping/my-tasks" : "/housekeeping/tasks";
  }, [isHousekeeping]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (isHousekeeping) {
        const taskRes = await api.get(tasksEndpoint);
        setTasks(taskRes.data.tasks || taskRes.data || []);
        return;
      }

      // admin/manager view
      const [taskRes, roomRes, userRes] = await Promise.all([
        api.get(tasksEndpoint),
        api.get("/rooms"),
        api.get("/users"),
      ]);

      setTasks(taskRes.data.tasks || taskRes.data || []);
      setRooms(roomRes.data.rooms || roomRes.data || []);

      const allUsers = userRes.data.users || userRes.data || [];
      setStaff(
        allUsers.filter(
          (u) => u.role === "housekeeping" && u.isActive !== false
        )
      );
    } catch (err) {
      console.error("Load housekeeping error", err);
      setError(err?.response?.data?.message || "Failed to load housekeeping.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksEndpoint]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

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
      await loadData();
    } catch (err) {
      console.error("Create housekeeping task error", err);
      setError(
        err.response?.data?.message || "Failed to create housekeeping task."
      );
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/housekeeping/tasks/${id}/status`, { status });
      await loadData();
    } catch (err) {
      console.error("Update housekeeping status error", err);
      setError(err?.response?.data?.message || "Failed to update task status.");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>
        {isHousekeeping ? "My Housekeeping Tasks" : "Housekeeping"}
      </h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        {isHousekeeping
          ? "Work on assigned rooms, start cleaning and mark tasks as done."
          : "Create and manage cleaning tasks and room readiness."}
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

      {/* ✅ Admin/Manager: Create task form */}
      {!isHousekeeping && (
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

            <Field label="Description">
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

      {/* Tasks table */}
      {loading ? (
        <div>Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div style={{ color: "#9ca3af", fontSize: 13 }}>
          No tasks found.
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
              <Th>Room</Th>
              <Th>{isHousekeeping ? "Tasks / Notes" : "Description"}</Th>
              {!isHousekeeping && <Th>Assigned to</Th>}
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id} style={{ borderBottom: "1px solid #111827" }}>
                <Td>{t.room?.roomNumber || "—"}</Td>
                <Td>{t.description || t.notes || "—"}</Td>
                {!isHousekeeping && <Td>{t.assignedTo?.name || "Unassigned"}</Td>}
                <Td style={{ textTransform: "capitalize" }}>{t.status}</Td>
                <Td>
                  {t.status !== "in_progress" && t.status !== "done" && (
                    <button
                      onClick={() => updateStatus(t._id, "in_progress")}
                      style={smallBtn}
                    >
                      Start
                    </button>
                  )}{" "}
                  {t.status !== "done" && (
                    <button
                      onClick={() => updateStatus(t._id, "done")}
                      style={smallBtn}
                    >
                      Mark done
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* small note for admin/manager */}
      {isAdminOrManager && (
        <p style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
          Tip: Assign tasks to housekeeping staff so they appear in their dashboard.
        </p>
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
