// src/services/api.js
import axios from "axios";

// env se lo, warna local fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

console.log("API_BASE_URL =>", API_BASE_URL);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("moonlight_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
