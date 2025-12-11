// src/pages/Terms.jsx
import "../styles/terms.css";

function Terms() {
  const lastUpdated = "March 10, 2025";

  return (
    <div className="ml-terms-root">
      <main className="ml-terms-main">
        {/* =======================
            HERO
        ======================== */}
        <section className="ml-terms-hero">
          <div className="ml-terms-hero-inner">
            <div className="ml-terms-hero-left">
              <p className="ml-terms-pill">Terms &amp; Conditions</p>
              <h1 className="ml-terms-heading">
                Staying at Moonlight comes
                <br />
                with clear, simple policies.
              </h1>
              <p className="ml-terms-sub">
                Please review these terms carefully before booking or staying at
                Moonlight. By confirming a reservation or accessing our
                property, you agree to follow these guidelines.
              </p>
              <p className="ml-terms-updated">
                Last updated: <span>{lastUpdated}</span>
              </p>
            </div>

            <div className="ml-terms-hero-right">
              <div className="ml-terms-hero-card">
                <h2 className="ml-terms-hero-card-title">
                  In short, we aim to keep every stay:
                </h2>
                <ul className="ml-terms-hero-list">
                  <li>Comfortable and safe for all guests.</li>
                  <li>Transparent in pricing, payments and fees.</li>
                  <li>Respectful of privacy and personal data.</li>
                </ul>
                <p className="ml-terms-hero-note">
                  This page is a general template. Please update it with your
                  own legal wording and have it reviewed by a professional
                  before using it in production.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            TERMS CONTENT
        ======================== */}
        <section className="ml-terms-content">
          <div className="ml-terms-layout">
            {/* Side summary / quick links */}
            <aside className="ml-terms-aside">
              <h3 className="ml-terms-aside-title">On this page</h3>
              <ul className="ml-terms-aside-list">
                <li>
                  <a href="#scope">1. Scope of these Terms</a>
                </li>
                <li>
                  <a href="#booking">2. Bookings &amp; Payments</a>
                </li>
                <li>
                  <a href="#cancellations">3. Cancellations &amp; Changes</a>
                </li>
                <li>
                  <a href="#stay">4. During Your Stay</a>
                </li>
                <li>
                  <a href="#liability">5. Liability &amp; Disclaimers</a>
                </li>
                <li>
                  <a href="#privacy">6. Privacy &amp; Data</a>
                </li>
                <li>
                  <a href="#general">7. General Provisions</a>
                </li>
              </ul>
            </aside>

            {/* Main legal copy */}
            <div className="ml-terms-body">
              {/* 1. Scope */}
              <section id="scope" className="ml-terms-section">
                <h2 className="ml-terms-section-title">
                  1. Scope of these Terms
                </h2>
                <p>
                  These Terms &amp; Conditions (&quot;Terms&quot;) apply to all
                  reservations, stays and services provided by{" "}
                  <strong>Moonlight Resort &amp; Suites</strong> (&quot;we&quot;,
                  &quot;us&quot;, &quot;Moonlight&quot;). By making a booking,
                  checking in or using our website, you agree to be bound by
                  these Terms.
                </p>
                <p>
                  If you are booking on behalf of another person or a group, you
                  confirm that you are authorised to accept these Terms on their
                  behalf.
                </p>
              </section>

              {/* 2. Booking & Payments */}
              <section id="booking" className="ml-terms-section">
                <h2 className="ml-terms-section-title">
                  2. Bookings &amp; Payments
                </h2>
                <ul className="ml-terms-list">
                  <li>
                    A reservation is considered confirmed once you receive a
                    booking confirmation email or message from Moonlight.
                  </li>
                  <li>
                    We may require a valid credit/debit card or advance
                    deposit to guarantee your booking. Details will be shown at
                    the time of booking.
                  </li>
                  <li>
                    Rates are quoted per room, per night unless stated
                    otherwise, and may include or exclude taxes/fees depending
                    on the offer selected.
                  </li>
                  <li>
                    Additional charges (for example, extra guests, meals,
                    late check-out or damages) may be applied to your account
                    and must be settled before departure.
                  </li>
                </ul>
              </section>

              {/* 3. Cancellations & Changes */}
              <section id="cancellations" className="ml-terms-section">
                <h2 className="ml-terms-section-title">
                  3. Cancellations, No-Shows &amp; Changes
                </h2>
                <ul className="ml-terms-list">
                  <li>
                    Each rate or offer may have its own cancellation window.
                    Please review the cancellation policy shown at the time of
                    booking.
                  </li>
                  <li>
                    If you cancel outside the free-cancellation window, Moonlight
                    may charge a fee up to the value of one night&apos;s stay or
                    the amount specified in the offer.
                  </li>
                  <li>
                    In case of a no-show (when you do not arrive on the first
                    night of your stay and have not informed us), the
                    reservation may be cancelled and any prepaid amounts may be
                    forfeited.
                  </li>
                  <li>
                    Date changes, shortening or extending your stay are subject
                    to availability and may result in a change of rate.
                  </li>
                </ul>
              </section>

              {/* 4. During your stay */}
              <section id="stay" className="ml-terms-section">
                <h2 className="ml-terms-section-title">
                  4. During Your Stay at Moonlight
                </h2>
                <ul className="ml-terms-list">
                  <li>
                    Standard check-in and check-out times will be communicated in
                    your booking confirmation. Early check-in or late
                    check-out may be available for an additional fee.
                  </li>
                  <li>
                    Guests are expected to respect other guests, Moonlight
                    staff and property. Excessive noise, unsafe behaviour or
                    illegal activities are not permitted.
                  </li>
                  <li>
                    Moonlight is a non-smoking property in all indoor areas.
                    Smoking in rooms or corridors may result in a cleaning fee
                    being charged to your account.
                  </li>
                  <li>
                    You are responsible for any loss or damage caused to the
                    room, furnishings or hotel property by you or your party,
                    and corresponding charges may apply.
                  </li>
                </ul>
              </section>

              {/* 5. Liability */}
              <section id="liability" className="ml-terms-section">
                <h2 className="ml-terms-section-title">
                  5. Liability &amp; Disclaimers
                </h2>
                <p>
                  While we take reasonable care to provide a safe and
                  comfortable environment, Moonlight is not liable for:
                </p>
                <ul className="ml-terms-list">
                  <li>
                    Loss, theft or damage to personal belongings, except where
                    required by law.
                  </li>
                  <li>
                    Indirect, incidental or consequential losses arising from
                    your stay, such as loss of business or travel disruptions.
                  </li>
                </ul>
                <p>
                  Nothing in these Terms limits any rights you may have under
                  applicable consumer protection laws.
                </p>
              </section>

              {/* 6. Privacy */}
              <section id="privacy" className="ml-terms-section">
                <h2 className="ml-terms-section-title">
                  6. Privacy &amp; Personal Data
                </h2>
                <p>
                  We collect and process personal data (such as your name,
                  contact details and booking information) in order to manage
                  reservations, provide services during your stay and comply
                  with legal requirements.
                </p>
                <p>
                  For more information on how we handle your information,
                  please see our separate <strong>Privacy Policy</strong>.
                </p>
              </section>

              {/* 7. General */}
              <section id="general" className="ml-terms-section">
                <h2 className="ml-terms-section-title">
                  7. General Provisions
                </h2>
                <ul className="ml-terms-list">
                  <li>
                    Moonlight may update these Terms from time to time. The
                    version in force at the time of your booking will apply to
                    that stay.
                  </li>
                  <li>
                    If any provision of these Terms is found invalid or
                    unenforceable, the remaining provisions will continue in
                    effect.
                  </li>
                  <li>
                    These Terms are governed by the laws of your operating
                    jurisdiction. Any disputes will be handled by the relevant
                    local courts.
                  </li>
                </ul>
                <p className="ml-terms-final-note">
                  If you have any questions about these Terms or need
                  clarification before booking, please contact our team at{" "}
                  <a href="mailto:stay@moonlightresort.com">
                    stay@moonlightresort.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Terms;
