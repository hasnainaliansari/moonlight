// src/pages/About.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/about.css";
import api from "../services/api";

const rightSliderSlides = [
  {
    id: 1,
    category: "Outdoor",
    location: "NYC, United States",
    title: "Sunset Lounge by the Bay",
    description:
      "Explore the perfect destination for comfort, relaxation and luxury — where every golden hour feels made for you.",
    image: "images/Sunset-Lounge-by-the-Bay.jpg",
  },
  {
    id: 2,
    category: "Wellness",
    location: "Vancouver, Canada",
    title: "Skyline Spa & Infinity Pool",
    description:
      "Reset with panoramic views, quiet corners and spa rituals curated to slow your day down to a gentle pause.",
    image: "images/Skyline-Spa-&-Infinity-Pool.jpg",
  },
  {
    id: 3,
    category: "City Stay",
    location: "Toronto, Canada",
    title: "Downtown Rooms with a View",
    description:
      "Stay close to what you love: bustling streets, rooftop cafés and rooms that open up to the city lights.",
    image: "images/Downtown-Rooms-with-a-View.jpg",
  },
];

// SECOND SECTION – left slider (card)
const comfortSlides = [
  {
    id: 1,
    tags: ["Hotel", "Room", "Luxury Hotel"],
    title: "Comfortable rooms with excellent care",
    description:
      "On-site convenience stores, fast room service and warm concierge support — all to make your stay effortless.",
    image: "images/comfortable-rooms.jpg",
  },
  {
    id: 2,
    tags: ["Business", "Meeting", "City Stay"],
    title: "Thoughtfully equipped for business travel",
    description:
      "Quiet workspaces, high-speed Wi-Fi and flexible meeting lounges mean you can switch from work to unwind in seconds.",
    image: "images/business-travel.jpg",
  },
  {
    id: 3,
    tags: ["Family", "Suite", "Weekend"],
    title: "Spacious suites for family getaways",
    description:
      "Interconnected rooms, playful corners and cosy lounges that keep everyone together without feeling crowded.",
    image: "images/family-travel.jpg",
  },
  {
    id: 4,
    tags: ["Wellness", "Spa", "Retreat"],
    title: "Wellness stays that slow time down",
    description:
      "From spa rituals to sunrise yoga and calming interior design, every detail is tuned for deep rest.",
    image: "images/wellness-travel.jpg",
  },
];

// images by room type (for DB rooms)
const ROOM_TYPE_IMAGES = {
  single:
    "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80",
  double:
    "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?auto=format&fit=crop&w=900&q=80",
  suite:
    "https://images.unsplash.com/photo-1501117716987-c8e1ecb2108a?auto=format&fit=crop&w=900&q=80",
  family:
    "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=900&q=80",
};

const EXPLORE_FALLBACK_ROOMS = [
  {
    id: "fallback-1",
    roomId: null,
    typeLabel: "Suite",
    name: "Crystal View Hotel",
    price: 250,
    capacity: 2,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    subtitle: "Ocean-facing suites with warm, modern interiors.",
  },
  {
    id: "fallback-2",
    roomId: null,
    typeLabel: "Deluxe",
    name: "The Grand Terrace",
    price: 220,
    capacity: 3,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
    subtitle: "Sunlit terraces, tall palms and open-plan lounges.",
  },
  {
    id: "fallback-3",
    roomId: null,
    typeLabel: "Resort",
    name: "Serenity Bay Inn",
    price: 280,
    capacity: 4,
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80",
    subtitle: "Quiet corners for long weekends and family escapes.",
  },
];

const AMENITIES = [
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
    text: "Airport transfers, local recommendations and last-minute requests handled with a smile.",
  },
  {
    id: 6,
    tag: "Convenience",
    title: "Parking & Local Transfers",
    text: "On-site parking and arranged cabs so getting in, out and around Moonlight stays effortless.",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    question: "What kind of stay is Moonlight – a resort, hotel or retreat?",
    answer:
      "Moonlight is a boutique-style stay that brings resort-level amenities, hotel-like convenience and a calm, retreat-style atmosphere together in one place.",
  },
  {
    id: 2,
    question: "What are the check-in and check-out timings?",
    answer:
      "Standard check-in starts from 2:00 PM and check-out is until 11:00 AM. Early check-in or late check-out can be arranged depending on availability.",
  },
  {
    id: 3,
    question: "Is Moonlight family-friendly?",
    answer:
      "Yes. We offer family suites, interconnected rooms, kids-friendly menus and outdoor spaces so family stays feel relaxed and comfortable.",
  },
  {
    id: 4,
    question: "How does booking cancellation or rescheduling work?",
    answer:
      "Most bookings come with a flexible policy. You can cancel or reschedule for free within the specified window before your stay date. Exact rules may vary depending on the rate plan you choose.",
  },
  {
    id: 5,
    question: "Are Wi-Fi, parking and breakfast included?",
    answer:
      "High-speed Wi-Fi is included with every stay. Breakfast and parking may be included or available as add-ons based on the package you select, and are clearly shown at the time of booking.",
  },
  {
    id: 6,
    question: "What options are available for group bookings or events?",
    answer:
      "For business offsites, family functions and small events, we offer dedicated meeting spaces, lawn areas and custom packages. Get in touch with our team for a tailored plan.",
  },
];


function About() {
  // section 1 – right column slider
  const [rightIndex, setRightIndex] = useState(0);
  const totalRightSlides = rightSliderSlides.length;

  // section 2 – left slider
  const [comfortIndex, setComfortIndex] = useState(0);
  const totalComfortSlides = comfortSlides.length;

  // section 3 – explore rooms
  const [exploreRooms, setExploreRooms] = useState([]);

  // FAQ
  const [openFaqId, setOpenFaqId] = useState(FAQ_ITEMS[0].id);

  const navigate = useNavigate();

  const toggleFaq = (id) => {
    setOpenFaqId((current) => (current === id ? null : id));
  };

  // Explore Best Rooms section ke liye top 3 rooms load karo
  useEffect(() => {
    const loadExploreRooms = async () => {
      try {
        const res = await api.get("/rooms/public");
        const rooms = res.data?.rooms || [];

        const mapped = rooms.slice(0, 3).map((room) => {
          const typeLabel = room.type
            ? room.type.charAt(0).toUpperCase() + room.type.slice(1)
            : "Room";

          const imgSrc =
            room.imageUrl ||
            ROOM_TYPE_IMAGES[room.type] ||
            "https://images.unsplash.com/photo-1500534314211-0a24cd07bb5a?auto=format&fit=crop&w=900&q=80";

          const price =
            room.pricePerNight != null
              ? Number(room.pricePerNight).toFixed(0)
              : 0;

          const capacity =
            room.capacity != null && room.capacity > 0 ? room.capacity : 2;

          return {
            id: room.id,
            roomId: room.id,
            typeLabel,
            name: `Room ${room.roomNumber}`,
            price,
            capacity,
            image: imgSrc,
            subtitle: room.features?.length
              ? room.features.slice(0, 2).join(" • ")
              : "Complimentary breakfast • Free Wi-Fi",
          };
        });

        if (mapped.length) {
          setExploreRooms(mapped);
        }
      } catch (err) {
        console.error("Failed to load explore rooms:", err);
      }
    };

    loadExploreRooms();
  }, []);

  const displayExploreRooms = exploreRooms.length
    ? exploreRooms
    : EXPLORE_FALLBACK_ROOMS;

  const handleViewAllRooms = () => {
    navigate("/accommodations");
  };

  const handleExploreRoomClick = (card) => {
    if (card.roomId) {
      navigate(`/rooms/${card.roomId}`);
    } else {
      navigate("/accommodations");
    }
  };

  // section 1 slider controls
  const goRightNext = () => {
    setRightIndex((prev) => (prev + 1) % totalRightSlides);
  };

  const goRightPrev = () => {
    setRightIndex((prev) => (prev === 0 ? totalRightSlides - 1 : prev - 1));
  };

  const formattedRightIndex = String(rightIndex + 1).padStart(2, "0");
  const formattedRightTotal = String(totalRightSlides).padStart(2, "0");
  const activeRightSlide = rightSliderSlides[rightIndex];

  // section 2 slider controls
  const goComfortNext = () => {
    setComfortIndex((prev) => (prev + 1) % totalComfortSlides);
  };

  const goComfortPrev = () => {
    setComfortIndex((prev) =>
      prev === 0 ? totalComfortSlides - 1 : prev - 1
    );
  };

  const activeComfortSlide = comfortSlides[comfortIndex];

  const handleBookNow = () => {
  navigate("/accommodations");
};

const handleAmenitiesClick = () => {
  navigate("/amenities");
};


  return (
    <div className="about-root">
      <main className="about-shell">
        {/* =======================
            SECTION 1
           ======================= */}
        <section className="about-hero">
          {/* top pill */}
          <div className="about-top-row">
            <button type="button" className="about-top-pill">
              Let&apos;s know us <span className="about-top-pill-arrow">→</span>
            </button>
          </div>

          {/* main heading */}
          <h1 className="about-heading">
            Explore Stays, About Comfort,
            <br />
            Your Stay, Our Priority.
          </h1>

          {/* 3 column layout */}
          <div className="about-columns">
            {/* LEFT: About copy */}
            <div className="about-col about-col-left">
              <div className="about-left-pill">About Us</div>

              <h2 className="about-left-title">
                Moonlight is a trusted platform
                <br />
                connecting travelers with top
                <br />
                stays across the country.
              </h2>

              <p className="about-left-text">
                From weekend escapes to long business trips, we pair guests with
                handpicked properties that deliver on comfort, consistency and
                warm hospitality.
              </p>
              <p className="about-left-text">
                With every stay, our goal is simple: to make you feel taken care
                of, from the moment you book to the moment you check out.
              </p>

              <button type="button" className="about-primary-btn">
                Learn More
                <span className="about-btn-icon">↗</span>
              </button>
            </div>

            {/* CENTER: Feature image card (static) */}
            <div className="about-col about-col-center">
              <article className="about-main-card">
                <div
                  className="about-main-card-img"
                  style={{
                    backgroundImage: "url('images/about-nyc.jpg')",
                  }}
                />
                <div className="about-main-card-overlay">
                  <div className="about-main-card-pill-row">
                    <span className="about-main-chip">City Stay</span>
                    <span className="about-main-location">
                      NYC, United States
                    </span>
                  </div>

                  <h3 className="about-main-card-title">
                    A versatile platform
                    <br />
                    offering a wide range of
                    <br />
                    hotel options and services.
                  </h3>

                  <button
                    type="button"
                    className="about-main-arrow-btn"
                    aria-label="Open details"
                  >
                    ↗
                  </button>
                </div>
              </article>
            </div>

            {/* RIGHT: Image + text slider */}
            <div className="about-col about-col-right">
              <div className="about-right-slider">
                {/* Slide card */}
                <article className="about-right-card">
                  <div
                    className="about-right-image"
                    style={{
                      backgroundImage: `url(${activeRightSlide.image})`,
                    }}
                  >
                    <div className="about-right-top-row">
                      <span className="about-right-chip">
                        {activeRightSlide.category}
                      </span>
                    </div>

                    <div className="about-right-bottom-row">
                      <span className="about-right-location">
                        {activeRightSlide.location}
                      </span>
                      <button
                        type="button"
                        className="about-right-arrow"
                        aria-label="Open experience"
                      >
                        ↗
                      </button>
                    </div>
                  </div>

                  <div className="about-right-body">
                    <h3 className="about-right-title">
                      {activeRightSlide.title}
                    </h3>
                    <p className="about-right-text">
                      {activeRightSlide.description}
                    </p>
                  </div>
                </article>

                {/* controls under card */}
                <div className="about-right-controls">
                  <span className="about-right-counter">
                    {formattedRightIndex} / {formattedRightTotal}
                  </span>

                  <div className="about-right-nav">
                    <button
                      type="button"
                      className="about-right-nav-btn"
                      onClick={goRightPrev}
                      aria-label="Previous"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="about-right-nav-btn about-right-nav-btn-primary"
                      onClick={goRightNext}
                      aria-label="Next"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            SECTION 2
           ======================= */}
        <section className="about-comfort">
          <div className="about-comfort-inner">
            {/* LEFT: slider card (image + text) */}
            <div className="about-comfort-col about-comfort-left">
              <article className="about-comfort-card">
                {/* tags row */}
                <div className="about-comfort-tags">
                  {activeComfortSlide.tags.map((tag) => (
                    <span key={tag} className="about-tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* main area: image + copy */}
                <div className="about-comfort-main">
                  <div
                    className="about-comfort-image"
                    style={{
                      backgroundImage: `url(${activeComfortSlide.image})`,
                    }}
                  />

                  <div className="about-comfort-body">
                    <h3 className="about-comfort-title">
                      {activeComfortSlide.title}
                    </h3>
                    <p className="about-comfort-text">
                      {activeComfortSlide.description}
                    </p>

                    <button type="button" className="about-secondary-btn">
                      See Details
                      <span className="about-secondary-btn-icon">↗</span>
                    </button>
                  </div>
                </div>

                {/* footer controls */}
                <div className="about-comfort-footer">
                  <span className="about-comfort-counter">
                    {comfortIndex + 1} / {totalComfortSlides}
                  </span>

                  <div className="about-comfort-nav">
                    <button
                      type="button"
                      className="about-comfort-nav-btn"
                      onClick={goComfortPrev}
                      aria-label="Previous comfort slide"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="about-comfort-nav-btn about-comfort-nav-btn-primary"
                      onClick={goComfortNext}
                      aria-label="Next comfort slide"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </article>
            </div>

            {/* RIGHT: heading + small image + copy */}
            <div className="about-comfort-col about-comfort-right">
              <div className="about-comfort-heading">
                <h2 className="about-comfort-big-title">
                  Discover Excellence in Hospitality.
                  <br />
                  Trusted Hotels You Can Rely On.
                </h2>

                <button type="button" className="about-outline-pill">
                  Our promise
                  <span className="about-outline-pill-icon">↗</span>
                </button>
              </div>

              <div className="about-comfort-right-bottom">
                <div className="about-comfort-right-card">
                  <div
                    className="about-comfort-right-image"
                    style={{
                      backgroundImage: "url('images/hospitality.jpg')",
                    }}
                  >
                    <button
                      type="button"
                      className="about-comfort-plus"
                      aria-label="View more amenities"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="about-comfort-right-text">
                  <span className="about-asterisk" aria-hidden="true">
                    *
                  </span>
                  <p className="about-comfort-paragraph">
                    Our top-tier hotel amenities offer a comprehensive range of
                    experiences — from modern rooms and curated stays to 24/7
                    concierge support and seamless booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            SECTION 3 – Explore Best Rooms
           ======================= */}
        <section className="about-explore">
          <div className="about-explore-inner">
            {/* Top row: title + View All */}
            <div className="about-explore-top">
              <div className="about-explore-left">
                <span className="about-explore-pill">Facilities</span>
                <h2 className="about-explore-title">Explore Best Rooms</h2>
              </div>

              <button
                type="button"
                className="about-explore-view-btn"
                onClick={handleViewAllRooms}
              >
                View All
                <span className="about-explore-view-icon">↗</span>
              </button>
            </div>

            {/* Main row: 3 cards + side copy */}
            <div className="about-explore-main">
              <div className="about-explore-grid">
                {displayExploreRooms.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className="about-explore-card"
                    onClick={() => handleExploreRoomClick(card)}
                  >
                    <div
                      className="about-explore-img"
                      style={{ backgroundImage: `url(${card.image})` }}
                    >
                      <span
                        className="about-explore-dot"
                        aria-hidden="true"
                      />

                      <span className="about-explore-price">
                        ${card.price}
                        <span className="about-explore-price-sub">
                          / per night
                        </span>
                      </span>

                      <div className="about-explore-bottom">
                        <div className="about-explore-bottom-text">
                          <span className="about-explore-room-type">
                            {card.typeLabel} • Sleeps {card.capacity}
                          </span>
                          <h3 className="about-explore-name">{card.name}</h3>
                          <p className="about-explore-subtitle">
                            {card.subtitle}
                          </p>
                        </div>

                        <span
                          className="about-explore-arrow"
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="about-explore-copy">
                <h3 className="about-explore-copy-title">
                  Book your stay with confidence.
                </h3>
                <p className="about-explore-copy-text">
                  Whether you&apos;re planning a quick business stopover or a
                  long coastal retreat, our curated selection of rooms ensures
                  every booking comes with comfort, convenience and the little
                  details that make stays memorable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================
            SECTION 4 – Why Book With Moonlight
           ======================= */}
        <section className="about-why">
          <div className="about-why-inner">
            {/* LEFT: big hotel image + years badge */}
            <div className="about-why-media">
              <div
                className="about-why-photo"
                style={{
                  backgroundImage: "url('images/moonlight-building.jpg')",
                }}
              >
                <div className="about-why-badge">
                  <span className="about-why-badge-number">16</span>
                  <span className="about-why-badge-text">
                    Years of
                    <br />
                    Moonlight stays
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: dark content panel */}
            <div className="about-why-content">
              <p className="about-why-eyebrow">Why Book With Moonlight</p>
              <h2 className="about-why-title">
                Every stay, a better experience.
              </h2>
              <p className="about-why-sub">
                From personalised service to thoughtful amenities, Moonlight
                delivers the small details that turn every booking into a
                five-star memory.
              </p>

              <div className="about-why-features">
                <div className="about-why-feature">
                  <span className="about-why-dot" />
                  <div>
                    <h3 className="about-why-feature-title">
                      Luxury bedding in every room
                    </h3>
                    <p className="about-why-feature-text">
                      Premium mattresses, layered linens and blackout curtains
                      for deep, uninterrupted sleep.
                    </p>
                  </div>
                </div>

                <div className="about-why-feature">
                  <span className="about-why-dot" />
                  <div>
                    <h3 className="about-why-feature-title">
                      Seamless booking & check-in
                    </h3>
                    <p className="about-why-feature-text">
                      Simple online reservations, instant confirmations and
                      quick, hassle-free arrivals.
                    </p>
                  </div>
                </div>

                <div className="about-why-feature">
                  <span className="about-why-dot" />
                  <div>
                    <h3 className="about-why-feature-title">
                      Spaces for work & meetings
                    </h3>
                    <p className="about-why-feature-text">
                      Quiet corners, business-ready rooms and flexible lounges
                      for your team or clients.
                    </p>
                  </div>
                </div>

                <div className="about-why-feature">
                  <span className="about-why-dot" />
                  <div>
                    <h3 className="about-why-feature-title">
                      High-speed Wi-Fi throughout
                    </h3>
                    <p className="about-why-feature-text">
                      Reliable connectivity in every corner of Moonlight, so you
                      never miss a moment or a meeting.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="g-book-btn g-book-btn-lg about-why-cta"
                onClick={handleViewAllRooms}
              >
                Explore More
              </button>
            </div>
          </div>
        </section>

        {/* =======================
            SECTION 5 – Amenities
           ======================= */}
        <section className="about-amenities">
          <div className="about-amenities-inner">
            <div className="about-amenities-header">
              <p className="about-amenities-eyebrow">Amenities</p>
              <h2 className="about-amenities-title">
                Amenities that come standard at Moonlight.
              </h2>
              <p className="about-amenities-sub">
                From the way you sleep and work to how you unwind, every stay at
                Moonlight includes thoughtful comforts designed to keep you
                relaxed, connected and cared for.
              </p>

              <div className="about-amenities-pill-row">
                <span className="about-amenities-pill">Sleep</span>
                <span className="about-amenities-pill">Unwind</span>
                <span className="about-amenities-pill">Work</span>
                <span className="about-amenities-pill">Gather</span>
              </div>
            </div>

            <div className="about-amenities-grid">
              {AMENITIES.map((item) => (
                <article key={item.id} className="about-amenity-card">
                  <div className="about-amenity-top">
                    <span className="about-amenity-orbit">
                      <span className="about-amenity-moon">✦</span>
                    </span>
                    <span className="about-amenity-tag">{item.tag}</span>
                  </div>
                  <h3 className="about-amenity-title">{item.title}</h3>
                  <p className="about-amenity-text">{item.text}</p>
                </article>
              ))}
            </div>

            <div className="about-amenities-cta-row">
              <button
                type="button"
                className="g-book-btn g-book-btn-lg"
                onClick={() => navigate("/accommodations")}
              >
                Plan Your Stay
              </button>
              <span className="about-amenities-cta-hint">
                See how Moonlight turns simple stays into memorable experiences.
              </span>
            </div>
          </div>
        </section>

        {/* =======================
            SECTION 6 – FAQ
           ======================= */}
        <section className="about-faq">
          <div className="about-faq-inner">
            <div className="about-faq-header">
              <p className="about-faq-eyebrow">FAQ</p>
              <h2 className="about-faq-title">
                Frequently asked questions
                <br />
                about staying at Moonlight.
              </h2>
              <p className="about-faq-sub">
                Agar aap pehli baar Moonlight aa rahe hain ya regular guest
                hain, in short answers se aapko bookings, timings aur amenities
                ka quick overview mil jayega.
              </p>
            </div>

            <div className="about-faq-grid">
              {FAQ_ITEMS.map((item) => {
                const isOpen = item.id === openFaqId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`about-faq-item ${
                      isOpen ? "about-faq-item-open" : ""
                    }`}
                    onClick={() => toggleFaq(item.id)}
                  >
                    <div className="about-faq-question-row">
                      <h3 className="about-faq-question">{item.question}</h3>
                      <span className="about-faq-toggle">
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>

                    {isOpen && (
                      <p className="about-faq-answer">{item.answer}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
                {/* =======================
            SECTION 6 – Final CTA
           ======================= */}
        <section className="about-cta">
          <div className="about-cta-inner">
            <span className="about-cta-badge">Plan Your Next Stay</span>

            <h2 className="about-cta-title">
              Don&apos;t wait – make Moonlight your next getaway.
            </h2>

            <p className="about-cta-text">
              From cosy rooms and curated amenities to thoughtful service,
              Moonlight is built for weekends away, workcations and everything
              in between. Book your stay or explore what&apos;s included with
              every room.
            </p>

            <div className="about-cta-actions">
              <button
                type="button"
                className="g-book-btn g-book-btn-lg"
                onClick={handleBookNow}
              >
                Book Your Stay
              </button>

              <button
                type="button"
                className="about-cta-secondary"
                onClick={handleAmenitiesClick}
              >
                View Amenities
                <span className="about-cta-secondary-icon">↗</span>
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default About;
