// src/pages/Amenities.jsx
import { useNavigate } from "react-router-dom";
import "../styles/amenities.css";

const CORE_AMENITIES = [
  {
    id: 1,
    tag: "Sleep",
    title: "Signature Moonlight Bedding",
    text: "Layered linens, plush pillows and blackout curtains for nights that actually feel restful.",
  },
  {
    id: 2,
    tag: "Unwind",
    title: "Pool, Deck & Quiet Corners",
    text: "Sun loungers, shaded nooks and outdoor seating perfect for slow mornings and sunset breaks.",
  },
  {
    id: 3,
    tag: "Stay Connected",
    title: "High-Speed Wi-Fi Everywhere",
    text: "Business-grade Wi-Fi so calls, streams and work sessions stay smooth in every room and lounge.",
  },
  {
    id: 4,
    tag: "Taste",
    title: "In-Room Dining & Café",
    text: "All-day bites, handcrafted coffee and late-night comfort food brought straight to your door.",
  },
  {
    id: 5,
    tag: "Care",
    title: "24/7 Concierge Support",
    text: "Airport transfers, local tips and last-minute requests handled with warmth and detail.",
  },
  {
    id: 6,
    tag: "Convenience",
    title: "Parking & Local Transfers",
    text: "On-site parking and arranged cabs so getting in, out and around Moonlight stays effortless.",
  },
];

const EXPERIENCE_BANDS = [
  {
    id: 1,
    label: "Sleep",
    title: "Rest that actually feels like a reset.",
    text: "Soft lighting, calm interiors and sound-muffling layouts help you switch off from the world and tune into real rest.",
    bullets: [
      "Premium mattresses & layered linens",
      "Blackout curtains in every room",
      "Silent AC & climate control",
    ],
    image: "images/amen-sleep.jpg",
  },
  {
    id: 2,
    label: "Work",
    title: "Workspaces that respect your focus.",
    text: "Whether you’re on a call, finishing a pitch or doing email catch-up, Moonlight is built to support your flow.",
    bullets: [
      "Business-grade Wi-Fi in all rooms",
      "Quiet desks & lounge corners",
      "Meeting-ready common spaces",
    ],
    image: "images/amen-work.jpg",
  },
  {
    id: 3,
    label: "Unwind",
    title: "Slow moments, long conversations, soft evenings.",
    text: "From poolside afternoons to cosy indoor corners, you’ll always find a place to breathe and be.",
    bullets: [
      "Pool & deck seating",
      "Indoor lounges & reading nooks",
      "Café vibes from morning to late",
    ],
    image: "images/amen-unwind.jpg",
  },
];

function Amenities() {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/accommodations");
  };

  const handleExploreRooms = () => {
    navigate("/accommodations");
  };

  const handleAboutClick = () => {
    navigate("/about");
  };

  return (
    <div className="amenities-root">
      <main className="amenities-shell">
        {/* =========================
            HERO SECTION
           ========================= */}
        <section className="amen-hero">
          <div className="amen-hero-pill-row">
            <button
              type="button"
              className="amen-hero-pill"
              onClick={handleAboutClick}
            >
              Why guests love Moonlight
              <span className="amen-hero-pill-arrow">↗</span>
            </button>
          </div>

          <div className="amen-hero-layout">
            <div className="amen-hero-left">
              <p className="amen-hero-eyebrow">Amenities at Moonlight</p>
              <h1 className="amen-hero-title">
                Every stay comes with more
                <br />
                than just a room key.
              </h1>
              <p className="amen-hero-sub">
                From the mattress you sleep on to the Wi-Fi you work with and
                the spaces you unwind in, Moonlight is designed so every detail
                quietly takes care of you in the background.
              </p>

              <div className="amen-hero-actions">
                <button
                  type="button"
                  className="g-book-btn g-book-btn-lg"
                  onClick={handleBookNow}
                >
                  Book Your Stay
                </button>

                <button
                  type="button"
                  className="amen-ghost-btn"
                  onClick={handleExploreRooms}
                >
                  View Rooms & Suites
                </button>
              </div>

              <div className="amen-hero-tags">
                <span className="amen-hero-tag">Sleep</span>
                <span className="amen-hero-tag">Unwind</span>
                <span className="amen-hero-tag">Work</span>
                <span className="amen-hero-tag">Gather</span>
              </div>
            </div>

            <div className="amen-hero-right">
              <div className="amen-hero-card">
                <div
                  className="amen-hero-image"
                  style={{
                    backgroundImage: "url('images/amen-hero.jpg')",
                  }}
                />
                <div className="amen-hero-overlay">
                  <span className="amen-hero-chip">Moonlight Standard</span>
                  <h3 className="amen-hero-card-title">
                    Thoughtful comforts,
                    <br />
                    built into every stay.
                  </h3>
                  <p className="amen-hero-card-text">
                    Crisp sheets, warm lighting and staff that remember your
                    preferences — before you ask.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            CORE AMENITIES GRID
           ========================= */}
        <section className="amen-core">
          <div className="amen-core-header">
            <h2 className="amen-core-title">
              Amenities that come standard at Moonlight.
            </h2>
            <p className="amen-core-sub">
              No hidden upgrades, no complicated add-ons. These are the
              everyday comforts you can expect, no matter which room you book.
            </p>
          </div>

          <div className="amen-core-grid">
            {CORE_AMENITIES.map((item) => (
              <article key={item.id} className="amen-core-card">
                <div className="amen-core-top">
                  <span className="amen-core-orbit">
                    <span className="amen-core-moon">✦</span>
                  </span>
                  <span className="amen-core-tag">{item.tag}</span>
                </div>
                <h3 className="amen-core-card-title">{item.title}</h3>
                <p className="amen-core-card-text">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="amen-core-strip">
            <span className="amen-core-strip-item">Complimentary Wi-Fi</span>
            <span className="amen-core-strip-dot">•</span>
            <span className="amen-core-strip-item">Daily housekeeping</span>
            <span className="amen-core-strip-dot">•</span>
            <span className="amen-core-strip-item">
              In-room coffee & tea setup
            </span>
            <span className="amen-core-strip-dot">•</span>
            <span className="amen-core-strip-item">24/7 front desk</span>
          </div>
        </section>

        {/* =========================
            EXPERIENCE BANDS
           ========================= */}
        <section className="amen-experience">
          <div className="amen-experience-header">
            <p className="amen-experience-eyebrow">Designed Around Your Day</p>
            <h2 className="amen-experience-title">
              Sleep, work and unwind — all in one place.
            </h2>
            <p className="amen-experience-sub">
              Moonlight is more than a place to crash. It&apos;s a calm base to
              sleep deeply, stay productive and truly switch off when the day is
              done.
            </p>
          </div>

          <div className="amen-experience-list">
            {EXPERIENCE_BANDS.map((band) => (
              <article key={band.id} className="amen-experience-row">
                <div className="amen-experience-media">
                  <div
                    className="amen-experience-image"
                    style={{
                      backgroundImage: `url('${band.image}')`,
                    }}
                  >
                    <span className="amen-experience-label">
                      {band.label}
                    </span>
                  </div>
                </div>

                <div className="amen-experience-body">
                  <h3 className="amen-experience-row-title">{band.title}</h3>
                  <p className="amen-experience-row-text">{band.text}</p>

                  <ul className="amen-experience-bullets">
                    {band.bullets.map((b) => (
                      <li key={b} className="amen-experience-bullet">
                        <span className="amen-experience-dot" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =========================
            PRACTICAL DETAILS STRIP
           ========================= */}
        <section className="amen-details">
          <div className="amen-details-inner">
            <div className="amen-details-left">
              <h2 className="amen-details-title">
                The practical details, already handled.
              </h2>
              <p className="amen-details-text">
                From check-in to check-out, Moonlight takes care of the small,
                practical pieces so you can focus on the stay itself.
              </p>
            </div>

            <div className="amen-details-grid">
              <div className="amen-details-item">
                <h3 className="amen-details-item-title">Check-in & Check-out</h3>
                <p className="amen-details-item-text">
                  Thoughtful timing and smooth processes so arriving and leaving
                  never feels rushed.
                </p>
              </div>

              <div className="amen-details-item">
                <h3 className="amen-details-item-title">Parking & Access</h3>
                <p className="amen-details-item-text">
                  On-site parking and easy access routes for luggage, strollers
                  and wheelchairs.
                </p>
              </div>

              <div className="amen-details-item">
                <h3 className="amen-details-item-title">Security</h3>
                <p className="amen-details-item-text">
                  Discreet security, monitored common areas and staff presence
                  round the clock.
                </p>
              </div>

              <div className="amen-details-item">
                <h3 className="amen-details-item-title">Local Support</h3>
                <p className="amen-details-item-text">
                  Help with cabs, reservations and recommendations so you can
                  explore the area like a regular.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            FINAL CTA
           ========================= */}
        <section className="amen-final-cta">
          <div className="amen-final-cta-inner">
            <span className="amen-final-cta-badge">Plan Your Stay</span>
            <h2 className="amen-final-cta-title">
              Ready to experience Moonlight amenities in person?
            </h2>
            <p className="amen-final-cta-text">
              Choose your room, pick your dates and let the rest be handled for
              you. From the first night to the last checkout, Moonlight is built
              to feel like the calm in the middle of your busy calendar.
            </p>

            <div className="amen-final-cta-actions">
              <button
                type="button"
                className="g-book-btn g-book-btn-lg"
                onClick={handleBookNow}
              >
                Book Your Stay
              </button>

              <button
                type="button"
                className="amen-final-cta-secondary"
                onClick={handleExploreRooms}
              >
                View Rooms & Suites
                <span className="amen-final-cta-secondary-icon">↗</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Amenities;
