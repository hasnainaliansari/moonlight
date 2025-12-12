// src/utils/media.js
import { API_BASE_URL } from "../services/api";

// Generic helper for any image / media URL
export function resolveMediaUrl(raw) {
  if (!raw) return "";

  // 1) localhost absolute URL → replace host with API_BASE_URL
  if (
    raw.startsWith("http://localhost:5000") ||
    raw.startsWith("https://localhost:5000")
  ) {
    return raw.replace(/^https?:\/\/localhost:5000/, API_BASE_URL);
  }

  // 2) Already absolute (https from Unsplash, etc) → keep
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  // 3) Relative path ("/uploads/..." or "uploads/...")
  if (raw.startsWith("/")) {
    return `${API_BASE_URL}${raw}`;
  }

  return `${API_BASE_URL}/${raw.replace(/^\/+/, "")}`;
}
