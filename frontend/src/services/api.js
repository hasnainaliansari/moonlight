// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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
