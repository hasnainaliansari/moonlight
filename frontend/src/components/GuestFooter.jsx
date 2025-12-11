// src/components/GuestFooter.jsx
import { Link, useNavigate } from "react-router-dom";

function GuestFooter() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:stay@moonlightresort.com";
  };

  return (
    <footer className="ml-footer">
      <div className="ml-footer-shell">
        {/* TOP MAIN AREA */}
        <div className="ml-footer-main">
          {/* LEFT – CONTACT / CTA */}
          <div className="ml-footer-left">
            <p className="ml-footer-tag">Contact Us</p>

            <h2 className="ml-footer-heading">
              Interested in staying at Moonlight, planning an event,
              <br />
              or simply learning more?
            </h2>

            <p className="ml-footer-copy-text">
              Reach out to our team for bookings, collaborations or any
              questions about your next stay at Moonlight.
            </p>

            <button
              type="button"
              className="ml-footer-email-pill"
              onClick={handleEmailClick}
            >
              <span className="ml-footer-email-text">
                stay@moonlightresort.com
              </span>
              <span className="ml-footer-email-icon">↗</span>
            </button>
          </div>

          {/* RIGHT – NAV COLUMNS */}
          <div className="ml-footer-right">
            <div className="ml-footer-column">
              <h4 className="ml-footer-column-heading">Explore</h4>
              <button
                type="button"
                className="ml-footer-link"
                onClick={() => goTo("/accommodations")}
              >
                Rooms &amp; Suites
              </button>
              <button
                type="button"
                className="ml-footer-link"
                onClick={() => goTo("/amenities")}
              >
                Amenities
              </button>
              <button
                type="button"
                className="ml-footer-link"
                onClick={() => goTo("/offers")}
              >
                Offers
              </button>
              <button
                type="button"
                className="ml-footer-link"
                onClick={() => goTo("/about")}
              >
                About Moonlight
              </button>
            </div>

            <div className="ml-footer-column">
              <h4 className="ml-footer-column-heading">Connect</h4>
              <button type="button" className="ml-footer-link">
                Instagram
              </button>
              <button type="button" className="ml-footer-link">
                Facebook
              </button>
              <button type="button" className="ml-footer-link">
                LinkedIn
              </button>
              <button type="button" className="ml-footer-link">
                Twitter
              </button>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="ml-footer-divider" />

        {/* BOTTOM ROW */}
        <div className="ml-footer-bottom">
          <div className="ml-footer-bottom-left">
            {/* same logo style as header */}
            <Link to="/" className="g-logo ml-footer-logo">
              <span className="g-logo-icon">🌙</span>
              <span className="g-logo-text">
                Moonlight
                <span className="g-logo-sub">Resort &amp; Suites</span>
              </span>
            </Link>
          </div>

          <div className="ml-footer-bottom-right">
            <span className="ml-footer-bottom-copy">
              © {year} Moonlight Resort. All rights reserved.
            </span>
            <div className="ml-footer-bottom-links">
              <button
                type="button"
                className="ml-footer-bottom-link"
                onClick={() => goTo("/terms")}
              >
                Terms
              </button>
              <span className="ml-footer-dot">•</span>
              <button
                type="button"
                className="ml-footer-bottom-link"
                onClick={() => goTo("/privacy")}
              >
                Privacy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default GuestFooter;
