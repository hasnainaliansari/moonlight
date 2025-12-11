// src/pages/ForgotPassword.jsx
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || "";

  // 🔹 simple JS useState, no TypeScript generics
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setInfo(
        "If an account exists for this email, a 6-digit code has been sent."
      );
      setStep("verify");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not send code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!code || !newPassword) {
      setError("Please enter the code and your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });

      setInfo(res.data?.message || "Password has been updated.");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid or expired code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-shell">
        {/* LEFT : form side */}
        <div className="auth-panel auth-left">
          <div className="auth-header">
            <div className="auth-brand-pill">
              <span className="auth-brand-icon">🌙</span>
              <span className="auth-brand-text">
                Moonlight
                <span className="auth-brand-sub">Resort &amp; Suites</span>
              </span>
            </div>

            <div className="auth-header-right">
              <span className="auth-header-label">Country</span>
              <button type="button" className="auth-country-pill">
                Canada
                <span className="auth-flag">🇨🇦</span>
              </button>
            </div>
          </div>

          <div className="auth-card">
            <p className="auth-card-eyebrow">Account help</p>
            <h1 className="auth-card-title">
              Reset your
              <br />
              password.
            </h1>

            {/* Tabs: back to Login / Register */}
            <div className="auth-tabs">
              <button
                type="button"
                className="auth-tab auth-tab-secondary"
                onClick={() => navigate("/login")}
              >
                Back to login
              </button>
              <Link to="/signup" className="auth-tab auth-tab-secondary">
                Register
              </Link>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {info && !error && (
              <div className="auth-error" style={{ color: "#065f46" }}>
                {info}
              </div>
            )}

            {/* STEP 1: email + send code */}
            {step === "request" && (
              <form onSubmit={handleSendCode} autoComplete="off">
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="off"
                  />
                </div>

                <p className="auth-footer-text">
                  We&apos;ll send a 6-digit code to this email if an account
                  exists. Enter that code in the next step to choose a new
                  password.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-primary-btn"
                >
                  {loading ? "Sending code..." : "Send reset code"}
                </button>
              </form>
            )}

            {/* STEP 2: code + new password */}
            {step === "verify" && (
              <form onSubmit={handleResetPassword} autoComplete="off">
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">6-digit code</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    placeholder="123456"
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">New password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm password</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-primary-btn"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>

                <p className="auth-footer-text">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={handleSendCode}
                  >
                    Resend code
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT : same video / hero side as login */}
        <div className="auth-panel auth-right">
          <div className="auth-video-shell">
            <video className="auth-video" autoPlay loop muted playsInline>
              <source src="videos/auth_video_login.mp4" type="video/mp4" />
            </video>

            <div className="auth-video-overlay">
              <div className="auth-video-rooms">
                <div className="auth-room-chip">
                  <span className="auth-room-thumb auth-room-thumb-1" />
                  <span className="auth-room-label">Oceanview Suite 1505</span>
                </div>
                <div className="auth-room-chip">
                  <span className="auth-room-thumb auth-room-thumb-2" />
                  <span className="auth-room-label">Garden Villa 03</span>
                </div>
                <div className="auth-room-chip">
                  <span className="auth-room-thumb auth-room-thumb-3" />
                  <span className="auth-room-label">Infinity Pool Deck</span>
                </div>
              </div>

              <div className="auth-video-textblock">
                <p className="auth-video-eyebrow">
                  Moonlight Resort &amp; Suites
                </p>
                <h2 className="auth-video-title">
                  Your next escape
                  <br />
                  <span>starts here.</span>
                </h2>
                <p className="auth-video-sub">
                  Reset your password and get back to planning your stay with
                  Moonlight.
                </p>

                <div className="auth-video-tags">
                  <span className="auth-tag">Secure</span>
                  <span className="auth-tag">One-time code</span>
                  <span className="auth-tag">Account access</span>
                </div>
              </div>
            </div>

            <div className="auth-video-footer-pills">
              <span className="auth-video-footer-pill">Support</span>
              <span className="auth-video-footer-pill">Account help</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
