// src/pages/Rooms.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

function getSlotsForRoomType(type) {
  switch (type) {
    case "single":
    case "double":
      return ["main", "bathroom"];
    case "suite":
    case "family":
      return ["main", "bathroom", "living", "kitchen"];
    default:
      return ["main"];
  }
}

function getSlotLabel(slot) {
  switch (slot) {
    case "main":
      return "Main";
    case "bathroom":
      return "Bathroom";
    case "living":
      return "Living/Dining";
    case "kitchen":
      return "Kitchen";
    default:
      return slot;
  }
}

function getImageForSlot(room, slot) {
  if (room.images && room.images.length > 0) {
    const found = room.images.find((img) => img.slot === slot);
    if (found) return found.url;
  }
  if (slot === "main" && room.imageUrl) {
    return room.imageUrl;
  }
  return null;
}

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    roomNumber: "",
    type: "single",
    floor: 1,
    pricePerNight: 100,
    capacity: 1,
    description: "",
  });

  const [imageFiles, setImageFiles] = useState({
    main: null,
    bathroom: null,
    living: null,
    kitchen: null,
  });

  const [creating, setCreating] = useState(false);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rooms");
      setRooms(res.data.rooms || res.data);
    } catch (error) {
      console.error("Load rooms error", error);
      setErr(
        error.response?.data?.message || "Failed to load rooms from server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageChange = (slot, file) => {
    setImageFiles((prev) => ({
      ...prev,
      [slot]: file || null,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErr("");
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("roomNumber", form.roomNumber);
      fd.append("type", form.type);
      fd.append("floor", form.floor);
      fd.append("pricePerNight", form.pricePerNight);
      fd.append("capacity", form.capacity);
      fd.append("description", form.description);

      if (imageFiles.main) {
        fd.append("roomImage", imageFiles.main);
      }
      if (imageFiles.bathroom) {
        fd.append("bathroomImage", imageFiles.bathroom);
      }
      if (imageFiles.living) {
        fd.append("livingImage", imageFiles.living);
      }
      if (imageFiles.kitchen) {
        fd.append("kitchenImage", imageFiles.kitchen);
      }

      await api.post("/rooms", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({
        roomNumber: "",
        type: "single",
        floor: 1,
        pricePerNight: 100,
        capacity: 1,
        description: "",
      });
      setImageFiles({
        main: null,
        bathroom: null,
        living: null,
        kitchen: null,
      });

      await loadRooms();
    } catch (error) {
      console.error("Create room error", error);
      setErr(error.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  // Update image for a specific slot on an existing room
  const handleRowImageChange = async (roomId, slot, file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("roomImage", file);

      await api.patch(`/rooms/${roomId}/image?slot=${slot}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await loadRooms();
    } catch (error) {
      console.error("Update room image error", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to update image"
      );
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Rooms</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        Manage room inventory, pricing, and images.
      </p>

      {/* Create room */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "#020617",
        }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Add new room</h2>
        {err && (
          <div
            style={{
              marginBottom: 8,
              fontSize: 13,
              color: "#fecaca",
            }}
          >
            {err}
          </div>
        )}
        <form
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <Field label="Room number">
            <input
              name="roomNumber"
              value={form.roomNumber}
              onChange={handleChange}
            />
          </Field>

          <Field label="Type">
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="family">Family</option>
            </select>
          </Field>

          <Field label="Floor">
            <input
              name="floor"
              type="number"
              value={form.floor}
              onChange={handleChange}
            />
          </Field>

          <Field label="Price / night">
            <input
              name="pricePerNight"
              type="number"
              value={form.pricePerNight}
              onChange={handleChange}
            />
          </Field>

          <Field label="Capacity">
            <input
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
            />
          </Field>

          <Field label="Main image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(
                  "main",
                  e.target.files && e.target.files[0]
                    ? e.target.files[0]
                    : null
                )
              }
            />
          </Field>

          <Field label="Bathroom image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(
                  "bathroom",
                  e.target.files && e.target.files[0]
                    ? e.target.files[0]
                    : null
                )
              }
            />
          </Field>

          <Field label="Living/Dining image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(
                  "living",
                  e.target.files && e.target.files[0]
                    ? e.target.files[0]
                    : null
                )
              }
            />
          </Field>

          <Field label="Kitchen image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(
                  "kitchen",
                  e.target.files && e.target.files[0]
                    ? e.target.files[0]
                    : null
                )
              }
            />
          </Field>

          <Field label="Description" full>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Field>

          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(to right, #22c55e, #22d3ee, #6366f1)",
              color: "#0f172a",
              fontWeight: 600,
              cursor: creating ? "wait" : "pointer",
              marginTop: 18,
            }}
          >
            {creating ? "Saving..." : "Add room"}
          </button>
        </form>
      </div>

      {/* Rooms table */}
      {loading ? (
        <div>Loading rooms…</div>
      ) : (
        <table
          style={{
            width: "100%",
            fontSize: 13,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <th style={{ padding: "8px 6px" }}>Images</th>
              <th style={{ padding: "8px 6px" }}>#</th>
              <th style={{ padding: "8px 6px" }}>Type</th>
              <th style={{ padding: "8px 6px" }}>Floor</th>
              <th style={{ padding: "8px 6px" }}>Price</th>
              <th style={{ padding: "8px 6px" }}>Capacity</th>
              <th style={{ padding: "8px 6px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => {
              const slots = getSlotsForRoomType(r.type);

              return (
                <tr
                  key={r._id}
                  style={{
                    borderBottom: "1px solid #111827",
                  }}
                >
                  <td style={{ padding: "6px 6px" }}>
                    {slots.map((slot) => {
                      const imgUrl = getImageForSlot(r, slot);
                      const label = getSlotLabel(slot);

                      return (
                        <div
                          key={slot}
                          style={{
                            marginBottom: 8,
                            paddingBottom: 6,
                            borderBottom: "1px dashed #1f2937",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              marginBottom: 2,
                            }}
                          >
                            {label}
                          </div>
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={label}
                              style={{
                                width: 70,
                                height: 48,
                                objectFit: "cover",
                                borderRadius: 6,
                                marginBottom: 4,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#6b7280",
                                marginBottom: 4,
                              }}
                            >
                              No image
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleRowImageChange(
                                r._id,
                                slot,
                                e.target.files && e.target.files[0]
                              )
                            }
                            style={{ fontSize: 11 }}
                          />
                        </div>
                      );
                    })}
                  </td>
                  <td style={{ padding: "6px 6px" }}>{r.roomNumber}</td>
                  <td
                    style={{
                      padding: "6px 6px",
                      textTransform: "capitalize",
                    }}
                  >
                    {r.type}
                  </td>
                  <td style={{ padding: "6px 6px" }}>{r.floor}</td>
                  <td style={{ padding: "6px 6px" }}>${r.pricePerNight}</td>
                  <td style={{ padding: "6px 6px" }}>{r.capacity}</td>
                  <td
                    style={{
                      padding: "6px 6px",
                      textTransform: "capitalize",
                    }}
                  >
                    {r.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Field({ label, children, full }) {
  const isInputLike =
    children &&
    (children.type === "input" ||
      children.type === "select" ||
      children.type === "textarea");

  return (
    <div style={{ display: full ? "block" : "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: 12,
          color: "#9ca3af",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      <div>
        {isInputLike
          ? {
              ...children,
              props: {
                ...children.props,
                style: {
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "#020617",
                  color: "#e5e7eb",
                  outline: "none",
                  ...(children.props.style || {}),
                },
              },
            }
          : children}
      </div>
    </div>
  );
}

export default Rooms;
