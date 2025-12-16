// src/layouts/DashboardLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 14px",
  borderRadius: 999,
  fontSize: 14,
  textDecoration: "none",
  color: isActive ? "#0f172a" : "#e5e7eb",
  background: isActive ? "#22c55e" : "transparent",
});

function DashboardLayout() {
  const { user, logout } = useAuth();
  const role = user?.role || "";

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isReceptionist = role === "receptionist";
  const isHousekeeping = role === "housekeeping";
  const isMaintenance = role === "maintenance";

  const isOps = isAdmin || isManager || isReceptionist;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <aside
        style={{
          width: 230,
          padding: 18,
          borderRight: "1px solid rgba(148,163,184,0.3)",
          background:
            "radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 55%), #020617",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>🌙 Moonlight</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            Hotel Console
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* ✅ Housekeeping: only housekeeping */}
          {isHousekeeping && (
            <NavLink to="/housekeeping" style={navLinkStyle}>
              Housekeeping
            </NavLink>
          )}

          {/* ✅ Maintenance: only maintenance */}
          {isMaintenance && (
            <NavLink to="/maintenance" style={navLinkStyle}>
              Maintenance
            </NavLink>
          )}

          {/* ✅ Other staff roles */}
          {!isHousekeeping && !isMaintenance && (
            <>
              <NavLink to="/dashboard" style={navLinkStyle}>
                Dashboard
              </NavLink>

              <NavLink to="/rooms" style={navLinkStyle}>
                Rooms
              </NavLink>

              <NavLink to="/bookings" style={navLinkStyle}>
                Bookings
              </NavLink>

              <NavLink to="/invoices" style={navLinkStyle}>
                Invoices
              </NavLink>

              {(isAdmin || isManager || isReceptionist) && (
                <NavLink to="/reviews-admin" style={navLinkStyle}>
                  Reviews
                </NavLink>
              )}

              {(isAdmin || isManager) && (
                <NavLink to="/reports" style={navLinkStyle}>
                  Reports
                </NavLink>
              )}

              {(isAdmin || isManager) && (
                <NavLink to="/staff" style={navLinkStyle}>
                  Staff
                </NavLink>
              )}

              {(isAdmin || isManager) && (
                <NavLink to="/guests" style={navLinkStyle}>
                  Guests
                </NavLink>
              )}

              {(isAdmin || isManager) && (
                <NavLink to="/settings" style={navLinkStyle}>
                  Settings
                </NavLink>
              )}

              {/* Housekeeping + Maintenance pages still visible to admin/manager */}
              {(isAdmin || isManager) && (
                <NavLink to="/housekeeping" style={navLinkStyle}>
                  Housekeeping
                </NavLink>
              )}

              {(isAdmin || isManager) && (
                <NavLink to="/maintenance" style={navLinkStyle}>
                  Maintenance
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 18,
            right: 18,
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          {user && (
            <>
              <div style={{ marginBottom: 6 }}>
                Logged in as <b>{user.name}</b>{" "}
                <span style={{ color: "#6b7280" }}>({user.role})</span>
              </div>
              <button
                onClick={logout}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "transparent",
                  color: "#e5e7eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "18px 22px 24px",
          boxSizing: "border-box",
          background: "#020617",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
