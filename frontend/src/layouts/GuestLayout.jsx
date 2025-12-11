// src/layouts/GuestLayout.jsx
import { Outlet } from "react-router-dom";
import GuestHeader from "../components/GuestHeader";
import GuestFooter from "../components/GuestFooter";
import "../styles/guest.css";

function GuestLayout() {
  return (
    <div className="guest-root">
      <div className="guest-bg-pattern" />
      <div className="guest-shell">
        <GuestHeader />
        <main className="guest-main">
          <Outlet />
        </main>
        
      </div>
      <GuestFooter />
    </div>
  );
}

export default GuestLayout;
