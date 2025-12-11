// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // {id, name, email, role}
  const [loading, setLoading] = useState(true);

  // ---------- INITIAL LOAD: read from localStorage ----------
  useEffect(() => {
    const token = localStorage.getItem("moonlight_token");
    const storedUser = localStorage.getItem("moonlight_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("moonlight_user");
      }
    }

    setLoading(false);
  }, []);

  // small helper: centralize localStorage + state
  const persistAuth = (token, userObj) => {
    localStorage.setItem("moonlight_token", token);
    localStorage.setItem("moonlight_user", JSON.stringify(userObj));
    setUser(userObj);
  };

  // ---------- EMAIL / PASSWORD LOGIN ----------
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;

    persistAuth(token, user);
    return user;
  };

  // ---------- SOCIAL LOGIN (Google / Facebook / Apple) ----------
  // payload: e.g. { accessToken } or { idToken } depending on provider
  const loginWithOAuth = async (provider, payload) => {
    const res = await api.post("/auth/oauth", {
      provider,
      ...payload,
    });

    const { token, user } = res.data;
    persistAuth(token, user);
    return user;
  };

  // ---------- FORGOT PASSWORD FLOW ----------
  // 1) request code (OTP) via email
  const requestPasswordReset = async (email) => {
    await api.post("/auth/forgot-password", { email });
  };

  // 2) submit OTP + new password
  const resetPassword = async (email, code, newPassword) => {
    await api.post("/auth/reset-password", {
      email,
      code,
      newPassword,
    });
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem("moonlight_token");
    localStorage.removeItem("moonlight_user");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    loginWithOAuth,
    logout,
    loading,
    isAuthenticated: !!user,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
