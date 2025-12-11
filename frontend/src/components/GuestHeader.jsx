import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GuestHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBookNow = () => {
    if (!user) {
      // guest ko pehle login / signup pe bhejo
      navigate("/login", {
        state: { fromGuestBook: true, from: location.pathname },
      });
    } else if (user.role === "guest") {
      // future: dedicated guest booking flow
      navigate("/guest/profile");
    } else {
      navigate("/dashboard");
    }
  };

  const goToProfileOrAuth = () => {
    if (!user) {
      navigate("/guest/profile", {
        state: { from: "/guest/profile", fromGuestBook: true },
      });
    } else if (user.role === "guest") {
      navigate("/guest/profile");
    } else {
      navigate("/dashboard");
    }
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Accommodations", to: "/accommodations" },
    { label: "About", to: "/about" },
    { label: "Amenities", to: "/amenities" },
  ];

  const firstName = user?.name ? user.name.split(" ")[0] : null;
  const profileTitle = user ? firstName || "Guest profile" : "Guest profile";
  const avatarInitial = firstName
    ? firstName.charAt(0).toUpperCase()
    : "👤";

  return (
    <header className="g-header">
      <div className="g-header-inner">
        {/* Logo / brand */}
        <Link to="/" className="g-logo">
          <span className="g-logo-icon">🌙</span>
          <span className="g-logo-text">
            Moonlight
            <span className="g-logo-sub">Resort &amp; Suites</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="g-nav-desktop">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                "g-nav-link" + (isActive ? " g-nav-link-active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="g-header-actions">
          {/* Guest profile pill */}
          <button
            className="g-phone-pill g-profile-pill"
            type="button"
            onClick={goToProfileOrAuth}
          >
            <span className="g-profile-avatar">{avatarInitial}</span>
            <span className="g-phone-text">{profileTitle}</span>
            <span className="g-phone-caret">▾</span>
          </button>

          <button
            type="button"
            className="g-book-btn"
            onClick={handleBookNow}
          >
            Book Now
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            className="g-menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span className="g-menu-line" />
            <span className="g-menu-line" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="g-nav-mobile">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                "g-nav-mobile-link" +
                (isActive ? " g-nav-mobile-link-active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}

          {/* PROFILE ROW: links ke turant neeche, buttons se upar */}
          <button
            type="button"
            className="g-nav-mobile-profile"
            onClick={() => {
              setOpen(false);
              goToProfileOrAuth();
            }}
          >
            <span className="g-nav-mobile-profile-avatar">
              {avatarInitial}
            </span>
            <span className="g-nav-mobile-profile-text">
              <span className="g-nav-mobile-profile-title">
                {profileTitle}
              </span>
              <span className="g-nav-mobile-profile-sub">
                {user
                  ? "View your stays & details"
                  : "Access your reservations"}
              </span>
            </span>
            <span className="g-nav-mobile-profile-chevron">›</span>
          </button>

          {user ? (
            <button
              type="button"
              className="g-nav-mobile-book"
              onClick={() => {
                setOpen(false);
                goToProfileOrAuth();
              }}
            >
              Open guest profile
            </button>
          ) : (
            <button
              type="button"
              className="g-nav-mobile-book"
              onClick={() => {
                setOpen(false);
                goToProfileOrAuth();
              }}
            >
              Sign in / Sign up
            </button>
          )}

          <button
            type="button"
            className="g-nav-mobile-book"
            style={{ marginTop: 6 }}
            onClick={() => {
              setOpen(false);
              handleBookNow();
            }}
          >
            Book Now
          </button>
        </div>
      )}
    </header>
  );
}

export default GuestHeader;
