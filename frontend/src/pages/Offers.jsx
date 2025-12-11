// src/pages/Offers.jsx
import { useNavigate } from "react-router-dom";
import "../styles/offers.css";

const FEATURED_OFFER = {
  tag: "Featured Offer",
  title: "Stay 3 Nights, Pay for 2",
  description:
    "Slow down and stretch your getaway. Book three consecutive nights at Moonlight and only pay for two – the third night is on us.",
  perks: [
    "Daily breakfast for two guests",
    "Late check-out (subject to availability)",
    "Complimentary welcome drinks on arrival",
  ],
  badge: "Save up to 33%",
  note: "Valid on select room types, Sunday to Thursday.",
};

const ML_OFFERS = [
  {
    id: 1,
    label: "Weekend Escape",
    title: "Coastal Weekend for Two",
    description:
      "Arrive Friday, unwind till Sunday with breakfast included, late check-out and access to all Moonlight amenities.",
    badge: "Best for couples",
    discount: "Save up to 20%",
    valid: "Valid on stays till 30 June.",
  },
  {
    id: 2,
    label: "Business Travel",
    title: "Midweek Work & Stay",
    description:
      "Perfect for business travellers – high-speed Wi-Fi, workspace-friendly rooms and same-day laundry discounts.",
    badge: "Corporate friendly",
    discount: "Save 15% on 2+ nights",
    valid: "Valid Monday to Thursday.",
  },
  {
    id: 3,
    label: "Family Time",
    title: "Family Suites & Fun",
    description:
      "Book connecting rooms or family suites with special rates, kids’ breakfast included and flexible cancellation.",
    badge: "Families welcome",
    discount: "Kids stay & eat free*",
    valid: "Select dates and room types.",
  },
];

function Offers() {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate("/accommodations");
  };

  return (
    <div className="ml-offers-root">
      <main className="ml-offers-main">
        {/* =======================
            HERO / INTRO
        ======================== */}
        <section className="ml-offers-hero">
          <div className="ml-offers-hero-inner">
            <div className="ml-offers-hero-left">
              <p className="ml-offers-pill">Offers &amp; Packages</p>
              <h1 className="ml-offers-heading">
                Make your Moonlight stay
                <br />
                even more rewarding.
              </h1>
              <p className="ml-offers-sub">
                Explore curated offers, seasonal packages and stay-longer deals
                designed to give you more time, more comfort and more value at
                Moonlight.
              </p>

              <div className="ml-offers-hero-badges">
                <span className="ml-offers-hero-chip">
                  ✔ Flexible cancellation on most rates
                </span>
                <span className="ml-offers-hero-chip">
                  ✔ Best rates when you book direct
                </span>
              </div>

              <button
                type="button"
                className="g-book-btn g-book-btn-lg ml-offers-hero-cta"
                onClick={handleBookClick}
              >
                View Rooms &amp; Suites
              </button>
            </div>

            <div className="ml-offers-hero-right">
              <div className="ml-offers-hero-card">
                <div className="ml-offers-hero-card-top">
                  <span className="ml-offers-hero-tag">
                    {FEATURED_OFFER.tag}
                  </span>
                  <span className="ml-offers-hero-badge">
                    {FEATURED_OFFER.badge}
                  </span>
                </div>

                <h2 className="ml-offers-hero-card-title">
                  {FEATURED_OFFER.title}
                </h2>
                <p className="ml-offers-hero-card-text">
                  {FEATURED_OFFER.description}
                </p>

                <ul className="ml-offers-perks-list">
                  {FEATURED_OFFER.perks.map((perk) => (
                    <li key={perk} className="ml-offers-perk-item">
                      <span className="ml-offers-perk-dot" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <p className="ml-offers-hero-note">{FEATURED_OFFER.note}</p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            OFFER CARDS GRID
        ======================== */}
        <section className="ml-offers-grid-section">
          <div className="ml-offers-grid-header">
            <h2 className="ml-offers-grid-title">Current Moonlight offers</h2>
            <p className="ml-offers-grid-sub">
              Choose the stay that matches your plans – whether it&apos;s a
              quick weekend reset, a focused work trip or a long-overdue family
              holiday.
            </p>
          </div>

          <div className="ml-offers-grid">
            {ML_OFFERS.map((offer) => (
              <article key={offer.id} className="ml-offer-card">
                <div className="ml-offer-card-top">
                  <span className="ml-offer-label">{offer.label}</span>
                  <span className="ml-offer-discount">
                    {offer.discount}
                  </span>
                </div>

                <h3 className="ml-offer-title">{offer.title}</h3>
                <p className="ml-offer-text">{offer.description}</p>

                <div className="ml-offer-meta">
                  <span className="ml-offer-badge">{offer.badge}</span>
                  <span className="ml-offer-valid">{offer.valid}</span>
                </div>

                <button
                  type="button"
                  className="ml-offer-cta"
                  onClick={handleBookClick}
                >
                  View eligible rooms
                  <span className="ml-offer-cta-icon">↗</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* =======================
            HOW IT WORKS STRIP
        ======================== */}
        <section className="ml-offers-steps">
          <div className="ml-offers-steps-inner">
            <div className="ml-offers-steps-left">
              <h2 className="ml-offers-steps-title">
                Booking an offer is simple.
              </h2>
              <p className="ml-offers-steps-sub">
                Most Moonlight offers can be booked directly online – no promo
                codes, no hidden conditions. Just pick your dates and select the
                package that suits you.
              </p>
            </div>

            <div className="ml-offers-steps-grid">
              <div className="ml-offers-step">
                <span className="ml-offers-step-number">01</span>
                <h3 className="ml-offers-step-title">Choose your dates</h3>
                <p className="ml-offers-step-text">
                  Select your stay dates and preferred room type on our
                  Accommodations page.
                </p>
              </div>
              <div className="ml-offers-step">
                <span className="ml-offers-step-number">02</span>
                <h3 className="ml-offers-step-title">
                  Pick an available offer
                </h3>
                <p className="ml-offers-step-text">
                  If an offer matches your dates, you&apos;ll see it listed with
                  the rate. Choose the package and review what&apos;s included.
                </p>
              </div>
              <div className="ml-offers-step">
                <span className="ml-offers-step-number">03</span>
                <h3 className="ml-offers-step-title">
                  Confirm &amp; check in
                </h3>
                <p className="ml-offers-step-text">
                  Complete your booking securely, receive instant confirmation
                  and simply share your ID on arrival.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            CTA STRIP
        ======================== */}
        <section className="ml-offers-cta-section">
          <div className="ml-offers-cta-inner">
            <div className="ml-offers-cta-left">
              <span className="ml-offers-cta-badge">Limited-time</span>
              <h2 className="ml-offers-cta-title">
                Ready to lock in your Moonlight offer?
              </h2>
              <p className="ml-offers-cta-text">
                Secure your dates early to access the best rates, flexible
                cancellation and our most popular rooms and suites.
              </p>
            </div>

            <div className="ml-offers-cta-actions">
              <button
                type="button"
                className="g-book-btn g-book-btn-lg ml-offers-cta-primary"
                onClick={handleBookClick}
              >
                Browse available rooms
              </button>

              <button
                type="button"
                className="ml-offers-cta-secondary"
                onClick={() => navigate("/contact")}
              >
                Talk to our team
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Offers;
