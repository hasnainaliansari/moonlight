// src/services/api.js
import axios from "axios";

// env se lo, warna local fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  // hamesha /api ke sath
  baseURL: `${API_BASE_URL}/api`,
  // agar kabhi cookies/vs use karni ho to:
  // withCredentials: true,
});

// Har request pe token laga do agar localStorage me ho
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("moonlight_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
