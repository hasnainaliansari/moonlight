import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./components/RequireAuth";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Invoices from "./pages/Invoices";
import Housekeeping from "./pages/Housekeeping";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Guests from "./pages/Guests";
import Settings from "./pages/Settings";
import GuestProfile from "./pages/GuestProfile";
import ReviewsAdmin from "./pages/ReviewsAdmin";

// Guest layout + pages
import GuestLayout from "./layouts/GuestLayout";
import GuestHome from "./pages/GuestHome";
import GuestRooms from "./pages/GuestRooms";
import GuestRoomDetail from "./pages/GuestRoomDetail";
import About from "./pages/About";
import Amenities from "./pages/Amenities";
import Offers from "./pages/Offers";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC GUEST SITE ---------- */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<GuestHome />} />
          <Route path="/accommodations" element={<GuestRooms />} />
          <Route path="/rooms/:id" element={<GuestRoomDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 🟢 Guest profile (same header/footer, auth handle inside page) */}
          <Route path="/guest/profile" element={<GuestProfile />} />
        </Route>

        {/* ---------- PUBLIC AUTH PAGES ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ---------- STAFF CONSOLE ---------- */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/housekeeping" element={<Housekeeping />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/settings" element={<Settings />} />

            {/* 🟢 Admin/staff reviews UI */}
            <Route path="/reviews-admin" element={<ReviewsAdmin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
