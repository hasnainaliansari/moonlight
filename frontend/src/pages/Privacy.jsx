// src/pages/Privacy.jsx
import "../styles/privacy.css";

function Privacy() {
  const lastUpdated = "March 10, 2025";

  return (
    <div className="ml-privacy-root">
      <main className="ml-privacy-main">
        {/* =======================
            HERO
        ======================== */}
        <section className="ml-privacy-hero">
          <div className="ml-privacy-hero-inner">
            <div className="ml-privacy-hero-left">
              <p className="ml-privacy-pill">Privacy Policy</p>
              <h1 className="ml-privacy-heading">
                Your stay at Moonlight
                <br />
                deserves privacy and trust.
              </h1>
              <p className="ml-privacy-sub">
                This Privacy Policy explains how Moonlight Resort &amp; Suites
                collects, uses and protects your information when you browse,
                book or stay with us.
              </p>
              <p className="ml-privacy-updated">
                Last updated: <span>{lastUpdated}</span>
              </p>
            </div>

            <div className="ml-privacy-hero-right">
              <div className="ml-privacy-hero-card">
                <h2 className="ml-privacy-hero-card-title">
                  In short, here&apos;s how we treat your data:
                </h2>
                <ul className="ml-privacy-hero-list">
                  <li>We only collect what we need for your stay.</li>
                  <li>We never sell your personal information.</li>
                  <li>We aim to keep your data safe and secure.</li>
                </ul>
                <p className="ml-privacy-hero-note">
                  This is a template for general guidance. Please customise it
                  for your own business and have it reviewed by a legal
                  professional before using it in production.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            MAIN CONTENT
        ======================== */}
        <section className="ml-privacy-content">
          <div className="ml-privacy-layout">
            {/* Side navigation */}
            <aside className="ml-privacy-aside">
              <h3 className="ml-privacy-aside-title">On this page</h3>
              <ul className="ml-privacy-aside-list">
                <li>
                  <a href="#intro">1. Who we are</a>
                </li>
                <li>
                  <a href="#data-we-collect">2. Data we collect</a>
                </li>
                <li>
                  <a href="#how-we-use">3. How we use your data</a>
                </li>
                <li>
                  <a href="#cookies">4. Cookies &amp; tracking</a>
                </li>
                <li>
                  <a href="#sharing">5. When we share data</a>
                </li>
                <li>
                  <a href="#retention-security">
                    6. Data retention &amp; security
                  </a>
                </li>
                <li>
                  <a href="#rights">7. Your choices &amp; rights</a>
                </li>
                <li>
                  <a href="#children">8. Children&apos;s privacy</a>
                </li>
                <li>
                  <a href="#contact">9. Contact Moonlight</a>
                </li>
              </ul>
            </aside>

            {/* Main body */}
            <div className="ml-privacy-body">
              {/* 1. Intro */}
              <section id="intro" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">1. Who we are</h2>
                <p>
                  This Privacy Policy applies to{" "}
                  <strong>Moonlight Resort &amp; Suites</strong> (&quot;Moonlight&quot;,
                  &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) and covers
                  information we collect when you visit our website, make a
                  reservation, contact us or stay at our property.
                </p>
                <p>
                  By using our services, you agree that your information will be
                  handled in accordance with this Privacy Policy.
                </p>
              </section>

              {/* 2. Data we collect */}
              <section id="data-we-collect" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">
                  2. Information we collect
                </h2>
                <p>
                  We collect different types of information depending on how you
                  interact with Moonlight:
                </p>
                <ul className="ml-privacy-list">
                  <li>
                    <strong>Identity details</strong> – name, title, date of
                    birth (if required), and government ID details where
                    required by law.
                  </li>
                  <li>
                    <strong>Contact details</strong> – email address, phone
                    number, billing address and postal address.
                  </li>
                  <li>
                    <strong>Booking information</strong> – stay dates, room
                    type, preferences, special requests and number of guests.
                  </li>
                  <li>
                    <strong>Payment information</strong> – limited payment
                    details processed through secure payment providers
                    (full card numbers are typically handled by the provider,
                    not stored by us directly).
                  </li>
                  <li>
                    <strong>Usage information</strong> – pages you visit on our
                    website, interactions with emails, and basic device data
                    (browser type, IP address, etc.).
                  </li>
                  <li>
                    <strong>On-site information</strong> – records related to
                    your stay such as check-in/check-out time, services used,
                    and incident or maintenance reports if applicable.
                  </li>
                </ul>
              </section>

              {/* 3. How we use your data */}
              <section id="how-we-use" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">
                  3. How we use your information
                </h2>
                <p>We use your data for the following purposes:</p>
                <ul className="ml-privacy-list">
                  <li>
                    <strong>To manage bookings</strong> – confirming
                    reservations, processing payments and communicating
                    pre-arrival information.
                  </li>
                  <li>
                    <strong>To provide your stay</strong> – preparing your room,
                    honouring preferences, managing check-in/check-out and
                    responding to support requests.
                  </li>
                  <li>
                    <strong>To improve our services</strong> – analysing
                    feedback, reviewing service usage and making Moonlight more
                    comfortable and efficient.
                  </li>
                  <li>
                    <strong>For marketing (where allowed)</strong> – sending
                    offers or updates about Moonlight that may be relevant to
                    you. You can opt out at any time.
                  </li>
                  <li>
                    <strong>To comply with law</strong> – fulfilling legal,
                    tax, safety or reporting obligations required by local
                    regulations.
                  </li>
                </ul>
              </section>

              {/* 4. Cookies */}
              <section id="cookies" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">
                  4. Cookies &amp; tracking technologies
                </h2>
                <p>
                  Our website may use cookies and similar technologies to
                  remember your preferences, understand how the site is used and
                  improve performance.
                </p>
                <ul className="ml-privacy-list">
                  <li>
                    <strong>Essential cookies</strong> – required for basic
                    website functionality such as secure login and completing a
                    booking.
                  </li>
                  <li>
                    <strong>Analytics cookies</strong> – help us understand how
                    visitors use the site so we can improve layout and content.
                  </li>
                  <li>
                    <strong>Preference cookies</strong> – remember choices like
                    language or past selections.
                  </li>
                </ul>
                <p>
                  You can control cookies via your browser settings and, where
                  implemented, through our cookie banner or preferences centre.
                </p>
              </section>

              {/* 5. Sharing */}
              <section id="sharing" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">
                  5. When we share your information
                </h2>
                <p>
                  We do not sell your personal information. We may share it only
                  in the following situations:
                </p>
                <ul className="ml-privacy-list">
                  <li>
                    <strong>Service providers</strong> – trusted partners who
                    help us run Moonlight (for example, payment processors,
                    booking engines, IT support). They only use your data to
                    provide services to us.
                  </li>
                  <li>
                    <strong>Legal and safety</strong> – when required by law,
                    regulation, court order or to protect the rights, property
                    or safety of guests and staff.
                  </li>
                  <li>
                    <strong>Business transfers</strong> – if Moonlight is
                    involved in a merger, acquisition or similar transaction,
                    your data may be transferred as part of that process.
                  </li>
                </ul>
              </section>

              {/* 6. Retention & security */}
              <section
                id="retention-security"
                className="ml-privacy-section"
              >
                <h2 className="ml-privacy-section-title">
                  6. Data retention &amp; security
                </h2>
                <p>
                  We keep your information only for as long as needed to fulfil
                  the purposes described in this policy, unless a longer
                  retention period is required by law (for example, tax or
                  regulatory obligations).
                </p>
                <p>
                  We use reasonable technical and organisational measures to
                  protect your data against unauthorised access, loss or
                  misuse. However, no system can be guaranteed 100% secure.
                </p>
              </section>

              {/* 7. Rights */}
              <section id="rights" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">
                  7. Your choices &amp; rights
                </h2>
                <p>
                  Depending on your location and applicable laws, you may have
                  the right to:
                </p>
                <ul className="ml-privacy-list">
                  <li>Access the personal data we hold about you.</li>
                  <li>
                    Request corrections to inaccurate or incomplete information.
                  </li>
                  <li>
                    Ask us to delete certain data, subject to legal obligations
                    to retain records.
                  </li>
                  <li>
                    Object to or restrict certain types of processing,
                    including direct marketing.
                  </li>
                  <li>
                    Withdraw consent where processing is based on your consent.
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the
                  details in the{" "}
                  <a href="#contact">Contact Moonlight</a> section below. We may
                  need to verify your identity before responding.
                </p>
              </section>

              {/* 8. Children */}
              <section id="children" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">
                  8. Children&apos;s privacy
                </h2>
                <p>
                  Our website and booking systems are intended for adults. We do
                  not knowingly collect personal data from children without the
                  consent of a parent or guardian, except where required for
                  legitimate booking details as part of a family stay.
                </p>
              </section>

              {/* 9. Contact */}
              <section id="contact" className="ml-privacy-section">
                <h2 className="ml-privacy-section-title">
                  9. Contact Moonlight about privacy
                </h2>
                <p>
                  If you have any questions, concerns or requests related to
                  this Privacy Policy or how we handle your data, please reach
                  out to us:
                </p>
                <p className="ml-privacy-contact-block">
                  <strong>Moonlight Resort &amp; Suites</strong>
                  <br />
                  Email:{" "}
                  <a href="mailto:privacy@moonlightresort.com">
                    privacy@moonlightresort.com
                  </a>
                  <br />
                  (You can replace this with your actual contact details.)
                </p>
                <p className="ml-privacy-final-note">
                  We may update this Privacy Policy from time to time. Material
                  changes will be highlighted on this page or communicated
                  during the booking process.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Privacy;
