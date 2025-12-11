import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/guest.css";

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

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ratingStars(n) {
  const safe = Math.max(0, Math.min(5, n || 0));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

function resolveFallbackHero(room) {
  if (room.imageUrl) return room.imageUrl;
  if (room.type && ROOM_TYPE_IMAGES[room.type]) {
    return ROOM_TYPE_IMAGES[room.type];
  }
  return "https://images.unsplash.com/photo-1500534314211-0a24cd07bb5a?auto=format&fit=crop&w=900&q=80";
}

// yyyy-mm-dd for today
function getTodayInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function GuestRoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking form state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numGuests, setNumGuests] = useState(1);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Public reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  // today + checkout min helpers
  const todayStr = getTodayInputValue();
  const checkOutMin = checkIn ? addDays(checkIn, 1) : todayStr;

  // Load room + bookings
  useEffect(() => {
    const load = async () => {
      try {
        const [roomRes, bookingRes] = await Promise.all([
          api.get(`/rooms/public/${id}`),
          api.get(`/rooms/public/${id}/bookings`),
        ]);

        setRoom(roomRes.data);
        setBookings(bookingRes.data?.bookings || []);
        const capacity = roomRes.data?.capacity ?? 1;
        setNumGuests(capacity > 0 ? 1 : 1);
      } catch (err) {
        console.error("Failed to load room detail:", err);
        setError("Unable to load room details right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Load PUBLIC reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError("");
        const res = await api.get(`/reviews/public/${id}`);
        const list = res.data?.reviews || res.data || [];
        setReviews(list);
      } catch (err) {
        console.error("Failed to load public reviews:", err);
        setReviewsError("Unable to load guest reviews right now.");
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  // Hydrate pending booking (after login/signup)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("moonlight_pending_booking");
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (pending && pending.roomId === id) {
        if (pending.checkInDate) setCheckIn(pending.checkInDate);
        if (pending.checkOutDate) setCheckOut(pending.checkOutDate);
        if (pending.numGuests) setNumGuests(pending.numGuests);
      }
    } catch {
      // ignore parse errors
    }
  }, [id]);

  if (loading) {
    return <div className="g-rooms-state">Loading room…</div>;
  }

  if (error || !room) {
    return (
      <div className="g-rooms-state g-rooms-state-error">
        {error || "Room not found."}
      </div>
    );
  }

  const slotOrder = ["main", "bathroom", "living", "kitchen", "other"];
  const fallbackHero = resolveFallbackHero(room);

  // Normalize gallery images
  let extraImages = [];
  if (room.images && room.images.length > 0) {
    const sorted = [...room.images].sort((a, b) => {
      const ai = slotOrder.indexOf(a.slot);
      const bi = slotOrder.indexOf(b.slot);
      const aIndex = ai === -1 ? slotOrder.length : ai;
      const bIndex = bi === -1 ? slotOrder.length : bi;
      return aIndex - bIndex;
    });

    extraImages = sorted
      .filter((img) => img && img.url)
      .map((img) => ({
        url: img.url,
        slot: img.slot,
      }));
  }

  let galleryImages = [];

  if (fallbackHero) {
    galleryImages.push({ url: fallbackHero, slot: "main" });
    extraImages.forEach((img) => {
      if (!galleryImages.some((g) => g.url === img.url)) {
        galleryImages.push(img);
      }
    });
  } else if (extraImages.length > 0) {
    galleryImages = extraImages;
  } else {
    galleryImages = [
      {
        url: "https://images.unsplash.com/photo-1500534314211-0a24cd07bb5a?auto=format&fit=crop&w=900&q=80",
        slot: "main",
      },
    ];
  }

  const clampedIndex =
    activeImageIndex < 0 || activeImageIndex >= galleryImages.length
      ? 0
      : activeImageIndex;

  const heroImg = galleryImages[clampedIndex].url;

  const hasExtraImages = galleryImages.length > 1;
  const sideImages = hasExtraImages ? galleryImages.slice(0, 4) : [];

  const price =
    room.pricePerNight != null ? room.pricePerNight.toFixed(0) : "0";

  const capacity = room.capacity != null ? room.capacity : 2;

  const typeLabel = room.type
    ? room.type.charAt(0).toUpperCase() + room.type.slice(1)
    : "Room";

  const avgRating =
    reviews && reviews.length
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  // date change handlers (past dates / min logic)
  const handleCheckInChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setCheckIn("");
      return;
    }

    // block past date manually (agar browser allow bhi kare)
    if (value < todayStr) return;

    setCheckIn(value);

    // ensure checkout hamisha check-in se aage ho
    if (checkOut && checkOut <= value) {
      const nextDay = addDays(value, 1);
      setCheckOut(nextDay);
    }
  };

  const handleCheckOutChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setCheckOut("");
      return;
    }

    // min already set, but safety:
    if (value <= (checkIn || todayStr)) return;
    setCheckOut(value);
  };

  // ----- Booking handler -----
  const handleReserveClick = async () => {
    setBookingError("");
    setBookingSuccess("");

    if (!checkIn || !checkOut) {
      setBookingError("Please select both check-in and check-out dates.");
      return;
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (outDate <= inDate) {
      setBookingError("Check-out date must be after check-in date.");
      return;
    }

    if (!isAuthenticated) {
      const pending = {
        roomId: id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numGuests,
      };
      localStorage.setItem(
        "moonlight_pending_booking",
        JSON.stringify(pending)
      );
      navigate("/login", { state: { from: `/rooms/${id}` } });
      return;
    }

    try {
      setBookingLoading(true);

      await api.post("/bookings/self", {
        roomId: id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numGuests,
      });

      setBookingSuccess(
        "Booking request submitted! Our team will confirm your stay shortly."
      );
      localStorage.removeItem("moonlight_pending_booking");

      const bookingRes = await api.get(`/rooms/public/${id}/bookings`);
      setBookings(bookingRes.data?.bookings || []);
    } catch (err) {
      console.error("Booking create error", err);
      setBookingError(
        err?.response?.data?.message ||
          "Could not create booking. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="g-room-detail-page">
      {/* TOP HEADER */}
      <header className="g-room-detail-header">
        <div>
          <p className="g-eyebrow">Room {room.roomNumber}</p>
          <h1 className="g-room-detail-title-main">{typeLabel} Room</h1>
          <p className="g-room-detail-header-sub">
            Cozy {typeLabel.toLowerCase()} room with thoughtful touches and
            warm, natural light — part of the Moonlight Resort &amp; Suites
            collection.
          </p>
        </div>
        <div className="g-room-detail-header-meta">
          <span className="g-room-chip">Sleeps {capacity} guests</span>
          <span
            className={`g-room-detail-status g-room-detail-status-${room.status}`}
          >
            {room.status}
          </span>
        </div>
      </header>

      {/* TOP GRID: GALLERY + SIDEBAR CARD */}
      <section className="g-room-detail-top">
        {/* Gallery left */}
        <div className="g-room-detail-media">
          <div
            className="g-room-detail-main-img"
            style={{ backgroundImage: `url(${heroImg})` }}
          />

          {sideImages.length > 0 && (
            <div className="g-room-detail-side">
              {sideImages.map((img, idx) => {
                const globalIndex = idx;
                return (
                  <button
                    key={`${img.slot}-${idx}`}
                    type="button"
                    className={
                      "g-room-thumb" +
                      (globalIndex === clampedIndex
                        ? " g-room-thumb-active"
                        : "")
                    }
                    onClick={() => setActiveImageIndex(globalIndex)}
                  >
                    <div
                      className="g-room-thumb-img"
                      style={{ backgroundImage: `url(${img.url})` }}
                    />
                    <span className="g-room-thumb-label">
                      {img.slot === "main"
                        ? "Main"
                        : img.slot.charAt(0).toUpperCase() +
                          img.slot.slice(1)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar booking card */}
        <aside className="g-room-book-card">
          <h2 className="g-room-book-title">Details</h2>

          <div className="g-room-book-row">
            <label className="g-room-book-label">From</label>
            <span className="g-room-book-price">
              ${price}
              <span className="g-room-book-price-suffix"> / night</span>
            </span>
          </div>

          {bookingError && (
            <div
              style={{
                marginBottom: 10,
                fontSize: 12,
                color: "#b91c1c",
              }}
            >
              {bookingError}
            </div>
          )}

          {bookingSuccess && (
            <div
              style={{
                marginBottom: 10,
                fontSize: 12,
                color: "#166534",
              }}
            >
              {bookingSuccess}
            </div>
          )}

          <div className="g-room-book-field">
            <label className="g-room-book-label">Dates</label>
            <div className="g-room-book-input-group">
              <input
                type="date"
                value={checkIn}
                onChange={handleCheckInChange}
                className="g-room-book-input"
                min={todayStr}
              />
              <span className="g-room-book-input-sep">→</span>
              <input
                type="date"
                value={checkOut}
                onChange={handleCheckOutChange}
                className="g-room-book-input"
                min={checkOutMin}
              />
            </div>
            <p className="g-room-book-hint">
              Choose your check-in and check-out dates. We&apos;ll confirm
              availability before finalizing your stay.
            </p>
          </div>

          <div className="g-room-book-field">
            <label className="g-room-book-label">Guests</label>
            <select
              value={numGuests}
              onChange={(e) => setNumGuests(Number(e.target.value) || 1)}
              className="g-room-book-input"
            >
              {Array.from({ length: capacity || 1 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} guest{i + 1 > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="g-book-btn g-book-btn-lg g-room-book-btn"
            onClick={handleReserveClick}
            disabled={bookingLoading}
          >
            {bookingLoading
              ? "Sending request..."
              : isAuthenticated
              ? "Reserve this room"
              : "Sign in to reserve"}
          </button>

          {!isAuthenticated && (
            <p className="g-room-book-note">
              You&apos;ll be asked to sign in or create an account before we
              confirm your booking.
            </p>
          )}

          {isAuthenticated && (
            <p className="g-room-book-note">
              No charge is made online. Our team will review your request and
              send a confirmation with payment details.
            </p>
          )}
        </aside>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="g-room-detail-main">
        <div className="g-room-main-left">
          {/* About */}
          <div className="g-room-block">
            <h2 className="g-section-title">About this room</h2>
            <p className="g-room-detail-description">
              {room.description ||
                "A thoughtfully designed space with soft linens, warm lighting and everything you need for slow mornings, afternoon naps and late-night conversations."}
            </p>
          </div>

          {/* Amenities */}
          <div className="g-room-block">
            <h3 className="g-room-subtitle">Amenities</h3>
            <div className="g-room-amenities-grid">
              {room.features?.length ? (
                room.features.map((f) => (
                  <div key={f} className="g-room-amenity">
                    <span className="g-room-amenity-dot" />
                    <span>{f}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="g-room-amenity">
                    <span className="g-room-amenity-dot" />
                    <span>Complimentary breakfast</span>
                  </div>
                  <div className="g-room-amenity">
                    <span className="g-room-amenity-dot" />
                    <span>High-speed Wi-Fi</span>
                  </div>
                  <div className="g-room-amenity">
                    <span className="g-room-amenity-dot" />
                    <span>Air conditioning</span>
                  </div>
                  <div className="g-room-amenity">
                    <span className="g-room-amenity-dot" />
                    <span>In-room coffee &amp; tea</span>
                  </div>
                  <div className="g-room-amenity">
                    <span className="g-room-amenity-dot" />
                    <span>Ensuite bathroom</span>
                  </div>
                  <div className="g-room-amenity">
                    <span className="g-room-amenity-dot" />
                    <span>24/7 front desk support</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* House rules / policies */}
          <div className="g-room-block g-room-block-split">
            <div>
              <h3 className="g-room-subtitle">House rules</h3>
              <ul className="g-room-rules">
                <li>Check-in after 3:00 PM</li>
                <li>Check-out before 11:00 AM</li>
                <li>No parties or events</li>
                <li>No smoking inside the room</li>
              </ul>
            </div>
            <div>
              <h3 className="g-room-subtitle">Cancellation</h3>
              <p className="g-room-text-muted">
                Cancel up to 48 hours before arrival for a full refund. Within
                48 hours, the first night is non-refundable.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: bookings list */}
        <div className="g-room-main-right">
          <div className="g-room-block">
            <h2 className="g-section-title">Booked date ranges</h2>
            <p className="g-room-text-muted">
              These are the existing reservations for this room. When you choose
              your stay, pick dates outside the ranges below.
            </p>

            {bookings.length === 0 && (
              <div className="g-rooms-state g-room-bookings-empty">
                No bookings yet – it&apos;s all yours.
              </div>
            )}

            {bookings.length > 0 && (
              <div className="g-room-bookings-list">
                {bookings.map((b) => (
                  <div key={b._id} className="g-room-booking-pill">
                    <span className="g-room-booking-dates">
                      {formatDate(b.checkInDate)} —{" "}
                      {formatDate(b.checkOutDate)}
                    </span>
                    <span className="g-room-booking-status">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PUBLIC GUEST REVIEWS */}
      <section
        className="g-room-block g-room-block-reviews"
        style={{ marginTop: 24, maxWidth: 900 }}
      >
        <h2 className="g-section-title">Guest reviews</h2>

        {reviewsLoading && (
          <p className="g-room-text-muted">Loading reviews…</p>
        )}

        {!reviewsLoading && reviewsError && (
          <p className="g-room-text-muted">{reviewsError}</p>
        )}

        {!reviewsLoading && !reviewsError && reviews.length === 0 && (
          <p className="g-room-text-muted">
            This room doesn&apos;t have any public reviews yet. Once guests
            share their feedback and it&apos;s approved, it will appear here.
          </p>
        )}

        {!reviewsLoading && !reviewsError && reviews.length > 0 && (
          <>
            {avgRating && (
              <div className="g-reviews-summary">
                <div className="g-reviews-summary-main">
                  <div className="g-reviews-summary-rating">{avgRating}</div>
                  <div className="g-reviews-summary-stars">
                    {ratingStars(Math.round(Number(avgRating) || 0))}
                  </div>
                </div>
                <p className="g-reviews-summary-text">
                  Based on {reviews.length} stay
                  {reviews.length > 1 ? "s" : ""} from recent guests.
                </p>
              </div>
            )}

            <div className="g-reviews-list">
              {reviews.map((r) => (
                <article key={r._id} className="g-review-card">
                  <header className="g-review-header">
                    <div className="g-review-rating">
                      <span className="g-review-stars">
                        {ratingStars(r.rating)}
                      </span>
                      <span className="g-review-rating-badge">
                        {r.rating}/5
                      </span>
                    </div>
                    <div className="g-review-meta">
                      <span className="g-review-guest">
                        {r.guest?.fullName || "Guest"}
                      </span>
                      <span className="g-review-dates">
                        {r.booking ? (
                          <>
                            {formatDate(r.booking.checkInDate)} –{" "}
                            {formatDate(r.booking.checkOutDate)}
                          </>
                        ) : (
                          formatDate(r.createdAt)
                        )}
                      </span>
                    </div>
                  </header>

                  <p className="g-review-comment">
                    {r.comment || "No comment provided."}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default GuestRoomDetail;
