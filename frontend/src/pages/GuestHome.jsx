// src/pages/GuestHome.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/guest.css";
import { resolveMediaUrl } from "../utils/media";

// Fallback static slides if DB returns nothing
const fallbackSlides = [
  {
    id: "static-1",
    title: "Oceanfront Suite",
    img: "https://images.unsplash.com/photo-1501117716987-c8e1ecb2108a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "static-2",
    title: "Breakfast by the Sea",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "static-3",
    title: "Pool & Lounge",
    img: "https://images.unsplash.com/photo-1519823551271-9d2a77e977cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "static-4",
    title: "Sunset Villas",
    img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "static-5",
    title: "Garden Walks",
    img: "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=900&q=80",
  },
];

// Room type -> placeholder image
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

const featureCards = [
  {
    id: 1,
    title: "High Airflow Rooms",
    subtitle: "Thoughtfully designed, naturally lit spaces.",
    img: "images/airflow.jpg",
  },
  {
    id: 2,
    title: "5000 Sq. Ft. Waterbody",
    subtitle: "Pool decks, loungers and quiet corners.",
    img: "images/pool-decks.jpg",
  },
  {
    id: 3,
    title: "Underwater Activities",
    subtitle: "Guided experiences for every comfort level.",
    img: "images/underwater.jpg",
  },
  {
    id: 4,
    title: "Golf by the Sea",
    subtitle: "Manicured greens with ocean views.",
    img: "images/golf.jpg",
  },
];

// Experience slider slides (bottom section)
const experienceSlides = [
  {
    id: 1,
    title: "Gastronomy",
    description:
      "Immerse yourself in the spices and flavours of curated sea-to-table cuisine and signature tasting menus.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Nature & Adventure",
    description:
      "Explore coastal trails, golden beaches and hidden lookout points just minutes from your stay.",
    image:
      "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Relax & Recharge",
    description:
      "Unwind by the pool, recharge at the spa and enjoy slow mornings with handcrafted breakfasts and ocean views.",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
];

function GuestHome() {
  const [dbSlides, setDbSlides] = useState([]);
  // hero slider active index (center card)
  const [active, setActive] = useState(() =>
    Math.floor((fallbackSlides.length || 1) / 2)
  );

  // bottom experience slider active index
  const [experienceIndex, setExperienceIndex] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Always prefer DB slides if any, else fallback
  const slides = dbSlides.length ? dbSlides : fallbackSlides;

  // Load rooms from DB for hero slider
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.get("/rooms/public");
        const rooms = res.data?.rooms || [];

        const mapped = rooms.slice(0, 5).map((room) => {
          const baseTitle = room.type
            ? room.type.charAt(0).toUpperCase() + room.type.slice(1)
            : "Room";

          // same style as GuestRooms/About: resolveMediaUrl
          const imgSrc = resolveMediaUrl(
            room.imageUrl ||
              (room.images && room.images.length > 0
                ? room.images[0].url
                : null) ||
              ROOM_TYPE_IMAGES[room.type] ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
          );

          return {
            id: room.id, // backend already sends { id: _id }
            roomId: room.id,
            title: `${baseTitle} – ${room.roomNumber}`,
            img: imgSrc,
          };
        });

        console.log("GuestHome hero mapped slides:", mapped);

        if (mapped.length) {
          setDbSlides(mapped);
          setActive(Math.floor(mapped.length / 2)); // center slide for DB data
        }
      } catch (err) {
        console.error("Failed to load rooms for hero:", err);
      }
    };

    loadRooms();
  }, []);

  // HERO slider controls
  const goNext = () =>
    setActive((prev) => (slides.length ? (prev + 1) % slides.length : 0));

  const goPrev = () =>
    setActive((prev) =>
      slides.length ? (prev === 0 ? slides.length - 1 : prev - 1) : 0
    );

  const handleBookClick = () => {
    navigate("/accommodations");
  };

  const handleExploreClick = () => {
    navigate("/accommodations");
  };

  const handleCardClick = (slide, index) => {
    setActive(index);
    if (slide.roomId) {
      navigate(`/rooms/${slide.roomId}`);
    }
  };

  // EXPERIENCE slider controls
  const totalExperienceSlides = experienceSlides.length;

  const goNextExperience = () => {
    setExperienceIndex((prev) => (prev + 1) % totalExperienceSlides);
  };

  const goPrevExperience = () => {
    setExperienceIndex((prev) =>
      prev === 0 ? totalExperienceSlides - 1 : prev - 1
    );
  };

  const formattedExperienceIndex = String(experienceIndex + 1).padStart(2, "0");
  const formattedExperienceTotal = String(totalExperienceSlides).padStart(
    2,
    "0"
  );

  return (
    <div className="g-home">
      {/* HERO SECTION: heading + slider */}
      <section className="g-hero">
        <div className="g-hero-copy">
          <p className="g-eyebrow">A boutique stay in nature</p>
          <h1 className="g-hero-title">
            We Promise Service that Leaves
            <br />
            Nothing to Ask for
          </h1>
          <p className="g-hero-sub">
            Wake up to sun-kissed shores, curated experiences, and a team that
            thinks one step ahead of every wish.
          </p>

          <div className="g-hero-actions">
            <button
              type="button"
              className="g-book-btn g-book-btn-lg"
              onClick={handleBookClick}
            >
              Book Your Stay
            </button>
            <button
              type="button"
              className="g-ghost-btn"
              onClick={handleExploreClick}
            >
              Explore Rooms →
            </button>
          </div>
        </div>

        {/* Hero slider */}
        <div className="g-hero-slider">
          <div className="g-hero-track">
            {slides.map((slide, index) => {
              const offset = index - active;
              let positionClass = "g-hero-card";

              if (offset === 0) positionClass += " g-hero-card-center";
              else if (offset === -1 || offset === 1)
                positionClass += " g-hero-card-side";
              else positionClass += " g-hero-card-far";

              return (
                <button
                  key={slide.id}
                  type="button"
                  className={positionClass}
                  onClick={() => handleCardClick(slide, index)}
                >
                  <div
                    className="g-hero-card-img"
                    style={{ backgroundImage: `url(${slide.img})` }}
                  />
                  <span className="g-hero-card-label">{slide.title}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom-right prev / next controls */}
          <div className="g-hero-controls">
            <button
              type="button"
              className="g-hero-arrow g-hero-arrow-left"
              onClick={goPrev}
            >
              ‹
            </button>
            <button
              type="button"
              className="g-hero-arrow g-hero-arrow-right"
              onClick={goNext}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* STATS + FEATURE GRID */}
      <section className="g-stats-section">
        <div className="g-stats-left">
          <div className="g-stat-block">
            <div className="g-stat-icon" aria-hidden="true" />
            <div className="g-stat-number">2000</div>
            <div className="g-stat-label">
              Hectares of landscaped greens, walking trails and open air.
            </div>
          </div>

          <div className="g-stat-block">
            <div className="g-stat-icon" aria-hidden="true" />
            <div className="g-stat-number">160+</div>
            <div className="g-stat-label">
              Guest rooms, suites and villas curated for every kind of stay.
            </div>
          </div>
        </div>

        <div className="g-stats-right">
          <div className="g-stats-copy">
            <h2 className="g-section-title">
              Finally, a place for all the things.
            </h2>
            <p className="g-section-sub">
              From sunrise swims to late-night conversations under the stars,
              Moonlight is built to hold every moment of your getaway.
            </p>
          </div>

          <div className="g-feature-grid">
            {featureCards.map((card) => (
              <div key={card.id} className="g-feature-card">
                <div
                  className="g-feature-img"
                  style={{ backgroundImage: `url(${card.img})` }}
                />
                <div className="g-feature-body">
                  <h3 className="g-feature-title">{card.title}</h3>
                  <p className="g-feature-sub">{card.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATION SECTION – MOONLIGHT STYLE */}
      <section className="ml-destination">
        <div className="ml-destination-inner">
          <h2 className="ml-destination-title">
            A destination to work, shop, play and retreat into nature.
          </h2>

          <div className="ml-destination-card">
            <div className="ml-destination-image-wrap">
              <div
                className="ml-destination-image"
                style={{
                  backgroundImage: "url('/images/destination.jpg')",
                }}
              />
              <span className="ml-destination-deco" aria-hidden="true" />
            </div>

            <div className="ml-destination-content">
              <div className="ml-destination-divider" aria-hidden="true" />

              <p className="ml-destination-text">
                Take advantage of exclusive deals and packages designed to
                elevate your stay. Whether it&apos;s a romantic getaway, a
                family vacation, or a business trip, we have something just for
                you.
              </p>

              <button
                type="button"
                className="g-book-btn g-book-btn-lg ml-destination-btn"
                onClick={handleBookClick}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SLIDER – bottom section */}
      <section className="ml-slider">
        <div className="ml-slider-inner">
          <h2 className="ml-slider-title">
            Seizing Every Moment on Your Vacation
          </h2>

          {/* Main slider area */}
          <div className="ml-slider-main">
            <div
              className="ml-slider-track"
              style={{
                transform: `translateX(-${experienceIndex * 100}%)`,
              }}
            >
              {experienceSlides.map((slide) => (
                <article className="ml-slide" key={slide.id}>
                  <div
                    className="ml-slide-image"
                    style={{
                      backgroundImage: `url('${slide.image}')`,
                    }}
                  />
                  <div className="ml-slide-caption">
                    <h3 className="ml-slide-title">{slide.title}</h3>
                    <p className="ml-slide-text">{slide.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="ml-slider-controls">
            <span className="ml-slider-counter">
              {formattedExperienceIndex} / {formattedExperienceTotal}
            </span>

            <div className="ml-slider-nav">
              <button
                type="button"
                className="ml-slider-arrow"
                onClick={goPrevExperience}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button
                type="button"
                className="ml-slider-arrow ml-slider-arrow-primary"
                onClick={goNextExperience}
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MOON FEATURES SECTION */}
      <section className="ml-moon-features">
        <div className="ml-moon-inner">
          {/* Small icon + heading */}
          <div className="ml-moon-heading">
            <span className="ml-moon-icon" aria-hidden="true">
              ✦
            </span>
            <h2 className="ml-moon-title">Filled with Features</h2>
          </div>

          {/* Feature cards */}
          <div className="ml-moon-grid">
            <article className="ml-moon-card">
              <div className="ml-moon-image-wrap">
                <div
                  className="ml-moon-image"
                  style={{
                    backgroundImage: "url('/images/feature-safe.jpg')",
                  }}
                />
              </div>
              <h3 className="ml-moon-card-title">Safe and Secure</h3>
              <p className="ml-moon-card-text">
                24/7 security, monitored access and staff that always keep an
                eye out for your comfort.
              </p>
            </article>

            <article className="ml-moon-card">
              <div className="ml-moon-image-wrap">
                <div
                  className="ml-moon-image"
                  style={{
                    backgroundImage: "url('/images/feature-cozy.jpg')",
                  }}
                />
              </div>
              <h3 className="ml-moon-card-title">Cozy Environment</h3>
              <p className="ml-moon-card-text">
                Warm interiors, soft lighting and spaces that feel like a second
                home.
              </p>
            </article>

            <article className="ml-moon-card">
              <div className="ml-moon-image-wrap">
                <div
                  className="ml-moon-image"
                  style={{
                    backgroundImage: "url('/images/feature-service.jpg')",
                  }}
                />
              </div>
              <h3 className="ml-moon-card-title">Satisfaction Guaranteed</h3>
              <p className="ml-moon-card-text">
                Thoughtful service, quick responses and a team that loves to say
                yes.
              </p>
            </article>

            <article className="ml-moon-card">
              <div className="ml-moon-image-wrap">
                <div
                  className="ml-moon-image"
                  style={{
                    backgroundImage: "url('/images/feature-views.jpg')",
                  }}
                />
              </div>
              <h3 className="ml-moon-card-title">Stunning Views</h3>
              <p className="ml-moon-card-text">
                Wake up to mountains, sea and skylines that make every morning
                special.
              </p>
            </article>
          </div>

          {/* CTA row */}
          <div className="ml-moon-cta">
            <span className="ml-moon-cta-badge">Exclusive</span>
            <h3 className="ml-moon-cta-title">Don&apos;t Wait – Stay Now!</h3>
            <p className="ml-moon-cta-text">
              Take advantage of exclusive deals and packages designed to elevate
              your stay. Whether it&apos;s a romantic escape or a business trip,
              we have something just for you.
            </p>

            <div className="ml-moon-cta-actions">
              <button
                type="button"
                className="g-book-btn g-book-btn-lg"
                onClick={handleBookClick}
              >
                Book Your Stay
              </button>

              <button type="button" className="ml-moon-cta-phone">
                (555) 123-4567
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GuestHome;
