// src/pages/GuestRooms.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/guest.css";
import { resolveMediaUrl } from "../utils/media";

// Fallback images by room type
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

const ROOM_TYPE_OPTIONS = [
  { label: "All types", value: "all" },
  { label: "Single", value: "single" },
  { label: "Double", value: "double" },
  { label: "Suite", value: "suite" },
  { label: "Family", value: "family" },
];

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "available" },
  { label: "Occupied", value: "occupied" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Maintenance", value: "maintenance" },
];

// Simple custom select (so browser ka blue dropdown na dikhe)
function MoonSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);

  const active = options.find((o) => o.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="g-rooms-select-shell">
      <button
        type="button"
        className="g-rooms-select-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{active.label}</span>
        <span className="g-rooms-select-caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="g-rooms-select-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`g-rooms-select-option${
                opt.value === value ? " g-rooms-select-option-active" : ""
              }`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GuestRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [status, setStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.get("/rooms/public");
        setRooms(res.data?.rooms || []);
      } catch (err) {
        console.error("Failed to load rooms:", err);
        setError("Unable to load rooms right now.");
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/rooms/${id}`);
  };

  // ----- filtering -----
  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.trim().toLowerCase();

    if (roomType !== "all" && room.type !== roomType) return false;
    if (status !== "all" && room.status !== status) return false;

    const price = Number(room.pricePerNight || 0);
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;

    if (!term) return true;

    const textParts = [
      room.roomNumber,
      room.type,
      room.status,
      ...(room.features || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return textParts.includes(term);
  });

  const totalCount = rooms.length;
  const visibleCount = filteredRooms.length;

  return (
    <div className="g-rooms-page">
      <header className="g-rooms-header">
        <p className="g-eyebrow">Accommodations</p>
        <h1 className="g-hero-title g-rooms-title">
          A room for every kind of stay.
        </h1>
        <p className="g-hero-sub g-rooms-sub">
          From cosy single rooms to sprawling family suites, explore Moonlight’s
          collection of spaces designed for slow mornings, sunset views and
          everything in between.
        </p>
      </header>

      {/* ---------- FILTER TOOLBAR ---------- */}
      <section className="g-rooms-toolbar">
        {/* Search row */}
        <div className="g-rooms-search-wrap">
          <label className="g-rooms-label" htmlFor="room-search">
            Search
          </label>
          <div className="g-rooms-search">
            <span className="g-rooms-search-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <line
                  x1="15.5"
                  y1="15.5"
                  x2="20"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              id="room-search"
              type="text"
              className="g-rooms-search-input"
              placeholder="Search by room number, type or features…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters row */}
        <div className="g-rooms-filters">
          {/* Room type */}
          <div className="g-rooms-filter">
            <span className="g-rooms-label">Room type</span>
            <MoonSelect
              value={roomType}
              onChange={setRoomType}
              options={ROOM_TYPE_OPTIONS}
            />
          </div>

          {/* Status */}
          <div className="g-rooms-filter">
            <span className="g-rooms-label">Status</span>
            <MoonSelect
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
          </div>

          {/* Price min / max */}
          <div className="g-rooms-filter g-rooms-filter-range">
            <span className="g-rooms-label">Price / night</span>
            <div className="g-rooms-price-range">
              <input
                type="number"
                min="0"
                className="g-rooms-input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="g-rooms-price-sep">–</span>
              <input
                type="number"
                min="0"
                className="g-rooms-input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* meta text */}
          <div className="g-rooms-filter g-rooms-filter-meta">
            <span className="g-rooms-meta">
              Showing {visibleCount} of {totalCount} rooms
            </span>
          </div>
        </div>
      </section>

      {/* ---------- STATES ---------- */}
      {loading && <div className="g-rooms-state">Loading rooms…</div>}
      {error && !loading && (
        <div className="g-rooms-state g-rooms-state-error">{error}</div>
      )}

      {/* ---------- GRID ---------- */}
      {!loading && !error && (
        <>
          {filteredRooms.length === 0 ? (
            <div className="g-rooms-state">
              No rooms match your filters. Try clearing some filters.
            </div>
          ) : (
            <div className="g-rooms-grid">
              {filteredRooms.map((room) => {
                // 1) Choose the raw image (from the database or fallback).
                const rawImg =
                  room.imageUrl ||
                  ROOM_TYPE_IMAGES[room.type] ||
                  "https://images.unsplash.com/photo-1500534314211-0a24cd07bb5a?auto=format&fit=crop&w=900&q=80";

                // 2) From the helper, return the final URL (convert localhost to Railway, and /uploads to full HTTPS).
                const imgSrc = resolveMediaUrl(rawImg);

                const typeLabel = room.type
                  ? room.type.charAt(0).toUpperCase() + room.type.slice(1)
                  : "Room";

                const price =
                  room.pricePerNight != null
                    ? Number(room.pricePerNight).toFixed(0)
                    : "0";

                const capacity =
                  room.capacity != null && room.capacity > 0
                    ? room.capacity
                    : 2;

                return (
                  <button
                    key={room.id}
                    type="button"
                    className="g-room-card"
                    onClick={() => handleCardClick(room.id)}
                  >
                    <div
                      className="g-room-card-img"
                      style={{ backgroundImage: `url(${imgSrc})` }}
                    >
                      <span className="g-room-card-chip">
                        {typeLabel} • Sleeps {capacity}
                      </span>
                      {room.status && (
                        <span
                          className={`g-room-status g-room-status-lg g-room-status-${room.status}`}
                        >
                          {room.status}
                        </span>
                      )}
                    </div>

                    <div className="g-room-card-body">
                      <h3 className="g-room-title">
                        Room {room.roomNumber || "—"}
                      </h3>
                      <p className="g-room-meta">
                        From <strong>${price}</strong> / night
                      </p>
                      {room.features?.length ? (
                        <p className="g-room-tags">
                          {room.features.slice(0, 3).join(" • ")}
                          {room.features.length > 3 ? " +" : ""}
                        </p>
                      ) : (
                        <p className="g-room-tags">
                          Complimentary Wi-Fi • Breakfast included
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GuestRooms;
