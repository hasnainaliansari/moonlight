// frontend/src/utils/media.js

// API base – same logic that exists in api.js
const rawBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Remove trailing slash
const API_BASE_URL = rawBase.replace(/\/+$/, "");

/**
 * Production-friendly media URL resolver
 *
 * - Replaces localhost URLs with the Railway (production) base
 * - Converts `/uploads/...` relative paths into full `https://backend/uploads/...` URLs
 * - Leaves pure external URLs (Unsplash, etc.) unchanged
 */
export function resolveMediaUrl(input) {
  if (!input) return input;

  // Already an absolute URL (http/https)
  if (input.startsWith("http://") || input.startsWith("https://")) {
    // If the backend URL was local, replace it with the production base
    let out = input;
    out = out.replace("http://localhost:5000", API_BASE_URL);
    out = out.replace("http://127.0.0.1:5000", API_BASE_URL);
    return out;
  }

  // `/uploads/...`
  if (input.startsWith("/uploads")) {
    return `${API_BASE_URL}${input}`;
  }

  // `uploads/...` (without leading slash)
  if (input.startsWith("uploads/")) {
    return `${API_BASE_URL}/${input}`;
  }

  // Everything else: return as-is
  return input;
}

// Optional: also keep a default export
export default resolveMediaUrl;
