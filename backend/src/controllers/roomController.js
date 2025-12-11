// src/controllers/roomController.js
const Room = require("../models/Room");
const Booking = require("../models/Booking");

/**
 * Helpers
 */

const getHeroImageUrl = (room) => {
  if (room.imageUrl) return room.imageUrl;

  if (room.images && room.images.length > 0) {
    const main = room.images.find((img) => img.slot === "main");
    if (main) return main.url;
    return room.images[0].url;
  }

  return null;
};

/**
 * PUBLIC guest-facing handlers
 */

// GET /api/rooms/public
const getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });

    res.json({
      count: rooms.length,
      rooms: rooms.map((r) => ({
        id: r._id,
        roomNumber: r.roomNumber,
        type: r.type,
        pricePerNight: r.pricePerNight,
        status: r.status,
        capacity: r.capacity,
        features: r.features,
        description: r.description,
        imageUrl: getHeroImageUrl(r),
        images: r.images || [],
      })),
    });
  } catch (error) {
    console.error("Get public rooms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/rooms/public/:id
const getPublicRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({
      id: room._id,
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerNight: room.pricePerNight,
      status: room.status,
      capacity: room.capacity,
      features: room.features,
      description: room.description,
      floor: room.floor,
      imageUrl: getHeroImageUrl(room),
      images: room.images || [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    });
  } catch (error) {
    console.error("Get public room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/rooms/public/:id/bookings
const getPublicRoomBookings = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const bookings = await Booking.find({
      room: id,
      status: { $in: ["pending", "confirmed", "checked_in"] },
    })
      .select("checkInDate checkOutDate status guestName guestEmail")
      .sort({ checkInDate: 1 });

    res.json({
      room: {
        id: room._id,
        roomNumber: room.roomNumber,
        type: room.type,
      },
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get public room bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * STAFF handlers (auth required)
 */

// GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/rooms  (admin/manager)
// Create room (supports multiple images)
const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      type,
      pricePerNight,
      status,
      floor,
      capacity,
      description,
      imageUrl, // optional URL for main image if ever needed
    } = req.body;

    if (!roomNumber || !type || !pricePerNight) {
      return res.status(400).json({
        message: "roomNumber, type and pricePerNight are required",
      });
    }

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    let finalImageUrl = imageUrl || undefined;
    const images = [];

    const files = req.files || {};

    if (Object.keys(files).length > 0) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const addImageSlot = (slot, fieldName) => {
        const arr = files[fieldName];
        if (arr && arr[0]) {
          const file = arr[0];
          const url = `${baseUrl}/uploads/rooms/${file.filename}`;
          images.push({ slot, url });
          if (slot === "main" && !finalImageUrl) {
            finalImageUrl = url;
          }
        }
      };

      addImageSlot("main", "roomImage");
      addImageSlot("bathroom", "bathroomImage");
      addImageSlot("living", "livingImage");
      addImageSlot("kitchen", "kitchenImage");
    }

    // Backward compat: if middleware was single() and gave req.file
    if (!images.length && req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const url = `${baseUrl}/uploads/rooms/${req.file.filename}`;
      images.push({ slot: "main", url });
      if (!finalImageUrl) {
        finalImageUrl = url;
      }
    }

    if (!finalImageUrl && images.length > 0) {
      finalImageUrl = images[0].url;
    }

    const room = await Room.create({
      roomNumber,
      type,
      pricePerNight: Number(pricePerNight),
      status: status || "available",
      floor: floor != null ? Number(floor) : 1,
      capacity: capacity != null ? Number(capacity) : 2,
      description,
      imageUrl: finalImageUrl,
      images,
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/rooms/:id
// Update room details (JSON only, no images)
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roomNumber,
      type,
      pricePerNight,
      status,
      floor,
      capacity,
      description,
      imageUrl,
    } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (typeof roomNumber !== "undefined") room.roomNumber = roomNumber;
    if (typeof type !== "undefined") room.type = type;
    if (typeof pricePerNight !== "undefined") {
      room.pricePerNight = Number(pricePerNight);
    }
    if (typeof status !== "undefined") room.status = status;
    if (typeof floor !== "undefined") room.floor = Number(floor);
    if (typeof capacity !== "undefined") room.capacity = Number(capacity);
    if (typeof description !== "undefined") room.description = description;
    if (typeof imageUrl !== "undefined") room.imageUrl = imageUrl;

    await room.save();

    res.json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/rooms/:id/image?slot=main|bathroom|living|kitchen
// Update one image slot via file upload
const updateRoomImageOnly = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedSlots = ["main", "bathroom", "living", "kitchen", "other"];
    const slotRaw = (req.query.slot || "main").toString().toLowerCase();
    const slot = allowedSlots.includes(slotRaw) ? slotRaw : "main";

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/rooms/${req.file.filename}`;

    if (!room.images) {
      room.images = [];
    }

    const existingIndex = room.images.findIndex((img) => img.slot === slot);
    if (existingIndex >= 0) {
      room.images[existingIndex].url = imageUrl;
    } else {
      room.images.push({ slot, url: imageUrl });
    }

    if (slot === "main") {
      room.imageUrl = imageUrl;
    } else if (!room.imageUrl) {
      // If main not set yet, use this as hero
      room.imageUrl = imageUrl;
    }

    await room.save();

    res.json({
      message: `Room ${slot} image updated successfully`,
      room,
    });
  } catch (error) {
    console.error("Update room image error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/rooms/:id/status
const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["available", "occupied", "cleaning", "maintenance"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ message: `Invalid status. Allowed: ${allowed.join(", ")}` });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.status = status;
    await room.save();

    res.json({
      message: "Room status updated",
      room,
    });
  } catch (error) {
    console.error("Update room status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/rooms/available?checkInDate=&checkOutDate=
const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "checkInDate and checkOutDate are required",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    if (checkOut <= checkIn) {
      return res
        .status(400)
        .json({ message: "checkOutDate must be after checkInDate" });
    }

    const blockingBookings = await Booking.find({
      status: { $in: ["pending", "confirmed", "checked_in"] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    }).select("room");

    const blockedRoomIds = blockingBookings.map((b) => b.room);

    const rooms = await Room.find({
      _id: { $nin: blockedRoomIds },
    }).sort({ roomNumber: 1 });

    res.json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get available rooms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // public
  getPublicRooms,
  getPublicRoomById,
  getPublicRoomBookings,
  // staff
  getRooms,
  createRoom,
  updateRoom,
  updateRoomImageOnly,
  updateRoomStatus,
  getAvailableRooms,
};
