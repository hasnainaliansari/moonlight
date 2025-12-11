// src/pages/Staff.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  "admin",
  "manager",
  "receptionist",
  "housekeeping",
  "maintenance",
];

function Staff() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "receptionist",
  });

  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "receptionist",
    password: "",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.users || res.data);
    } catch (err) {
      console.error("Load users error", err);
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/users", form);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "receptionist",
      });
      await loadUsers();
    } catch (err) {
      console.error("Create staff error", err);
      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (u) => {
    setEditUserId(u.id);
    setEditForm({
      name: u.name,
      role: u.role,
      password: "",
    });
  };

  const cancelEdit = () => {
    setEditUserId(null);
    setEditForm({ name: "", role: "receptionist", password: "" });
  };

  const handleUpdate = async (id) => {
    setError("");
    try {
      setSaving(true);
      await api.patch(`/users/${id}`, {
        name: editForm.name,
        role: editForm.role,
        password: editForm.password || undefined,
      });
      cancelEdit();
      await loadUsers();
    } catch (err) {
      console.error("Update user error", err);
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.id}/status`, {
        isActive: !user.isActive,
      });
      await loadUsers();
    } catch (err) {
      console.error("Toggle status error", err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Staff users</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        Manage hotel staff accounts, roles and access.
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

      {/* Create staff form */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "#020617",
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Create staff user</h2>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>
          Staff can log in to Moonlight Console to manage rooms, bookings and
          operations.
        </p>

        <form
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(160px, 2fr) minmax(180px, 2.5fr) minmax(140px, 1.5fr) minmax(130px, 1.5fr) auto",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Label>Name</Label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Staff name"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <Label>Email</Label>
            <input
              style={inputStyle}
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="name@example.com"
              type="email"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <Label>Temporary password</Label>
            <input
              style={inputStyle}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="At least 6 characters"
              type="password"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <Label>Role</Label>
            <select
              style={inputStyle}
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value }))
              }
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" style={primaryBtn} disabled={saving}>
            {saving ? "Saving…" : "Create user"}
          </button>
        </form>
      </div>

      {/* Staff list */}
      {loading ? (
        <div>Loading staff…</div>
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
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = currentUser && currentUser.id === u.id;
              const editing = editUserId === u.id;

              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #111827" }}>
                  <Td>
                    {editing ? (
                      <input
                        style={inputStyle}
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                    ) : (
                      <>
                        {u.name}
                        {isSelf && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 11,
                              color: "#22c55e",
                            }}
                          >
                            (you)
                          </span>
                        )}
                      </>
                    )}
                  </Td>

                  <Td>{u.email}</Td>

                  <Td>
                    {editing ? (
                      <select
                        style={inputStyle}
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, role: e.target.value }))
                        }
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ textTransform: "capitalize" }}>
                        {u.role}
                      </span>
                    )}
                  </Td>

                  <Td>
                    <span
                      style={{
                        fontSize: 12,
                        color: u.isActive ? "#4ade80" : "#f97316",
                      }}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </Td>

                  <Td>
                    {editing ? (
                      <>
                        <button
                          style={smallBtn}
                          onClick={() => handleUpdate(u.id)}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          style={{ ...smallBtn, marginLeft: 6, background: "#374151", color: "#e5e7eb" }}
                          type="button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={smallBtn}
                          type="button"
                          onClick={() => startEdit(u)}
                        >
                          Edit
                        </button>
                        {!isSelf && (
                          <button
                            style={{
                              ...smallBtn,
                              marginLeft: 6,
                              background: u.isActive ? "#f97316" : "#22c55e",
                            }}
                            type="button"
                            onClick={() => toggleStatus(u)}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

export default Staff;
