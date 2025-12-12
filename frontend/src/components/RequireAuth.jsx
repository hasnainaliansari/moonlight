import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireAuth() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: "#e5e7eb" }}>Checking session…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Do not allow the guest role to access the staff console
  if (user?.role === "guest") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
