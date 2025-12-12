// frontend/src/utils/media.js

// API base – same logic jo api.js me hai
const rawBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// trailing slash hata do
const API_BASE_URL = rawBase.replace(/\/+$/, "");

/**
 * Production-friendly media URL resolver
 *
 * - Localhost URLs ko Railway ke base se replace karega
 * - `/uploads/...` relative paths ko full `https://backend/uploads/...` banayega
 * - Pure external URLs (Unsplash etc) ko as-is chhodega
 */
export function resolveMediaUrl(input) {
  if (!input) return input;

  // Already absolute URL (http/https)
  if (input.startsWith("http://") || input.startsWith("https://")) {
    // Agar backend local tha to usko prod base se replace kar do
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

  // Baaki sab as-is
  return input;
}

// Optional default export bhi rakh dete hain
export default resolveMediaUrl;
