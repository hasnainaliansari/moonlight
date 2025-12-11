// src/pages/Signup.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// same client id jo Login.jsx mein use kar rahe ho
const GOOGLE_CLIENT_ID =
  "39602451122-j3ujp4tjc78meaiapn5bvjib7005lqt3.apps.googleusercontent.com";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOAuth, user, isAuthenticated } = useAuth();

  const from = location.state?.from || null;
  const fromGuestBook = location.state?.fromGuestBook || false;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false); // email signup
  const [socialLoading, setSocialLoading] = useState(null); // "google" | "facebook" | "apple" | null
  const [error, setError] = useState("");

  const googleButtonRef = useRef(null);

  const redirectAfterLogin = (loggedInUser, replace = false) => {
    if (!loggedInUser) return;

    if (loggedInUser.role === "guest") {
      const target = from || (fromGuestBook ? "/" : "/");
      navigate(target, { replace });
    } else {
      navigate("/dashboard", { replace });
    }
  };

  // agar pehle se logged in hai to redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectAfterLogin(user, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Register guest user (email/password)
      await api.post("/auth/register", { name, email, password });

      // signup ke baad login page pe bhejna (from state preserve)
      navigate("/login", {
        replace: true,
        state: from || fromGuestBook ? { from, fromGuestBook } : undefined,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- GOOGLE IDENTITY SERVICES (same as Login.jsx) ----------
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response?.credential) return;

          setError("");
          setSocialLoading("google");
          try {
            const loggedInUser = await loginWithOAuth("google", {
              idToken: response.credential,
            });
            redirectAfterLogin(loggedInUser, true);
          } catch (err) {
            setError(
              err?.response?.data?.message ||
                err?.message ||
                "Google sign-in failed. Please try again."
            );
          } finally {
            setSocialLoading(null);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        text: "signup_with",
        shape: "pill",
        size: "large",
        width: 260,
      });
    };

    const scriptId = "google-gsi-script";

    if (window.google && window.google.accounts && window.google.accounts.id) {
      initGoogle();
      return;
    }

    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      script.onload = initGoogle;
    }

    return () => {
      // cleanup optional – button rehne do
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Facebook / Apple placeholder handlers ----------
  const handleFacebookClick = () => {
    setError("Facebook sign-up is not configured yet.");
  };

  const handleAppleClick = () => {
    setError("Apple sign-up is not configured yet.");
  };

  const anyLoading = loading || !!socialLoading;

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
            <p className="auth-card-eyebrow">Join Moonlight</p>
            <h1 className="auth-card-title">
              Unlock stays, perks
              <br />
              and member-only offers.
            </h1>

            {/* Tabs: Register / Login */}
            <div className="auth-tabs">
              <button type="button" className="auth-tab auth-tab-active">
                Register
              </button>
              <Link
                to="/login"
                state={
                  from || fromGuestBook ? { from, fromGuestBook } : undefined
                }
                className="auth-tab auth-tab-secondary"
              >
                Login
              </Link>
            </div>

            {/* Social row */}
            <div className="auth-social-row">
              {/* Facebook */}
              <button
                type="button"
                className="auth-social-btn"
                aria-label="Continue with Facebook"
                onClick={handleFacebookClick}
                disabled={anyLoading}
              >
                <span className="auth-social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path
                      fill="#039be5"
                      d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"
                    ></path>
                    <path
                      fill="#fff"
                      d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359
                      c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729
                      C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"
                    ></path>
                  </svg>
                </span>
              </button>

              {/* Apple */}
              <button
                type="button"
                className="auth-social-btn"
                aria-label="Continue with Apple"
                onClick={handleAppleClick}
                disabled={anyLoading}
              >
                <span className="auth-social-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="28"
                    height="28"
                    viewBox="0 0 50 50"
                  >
                    <path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z"></path>
                  </svg>
                </span>
              </button>

              {/* Google – real GIS button */}
              <div ref={googleButtonRef} />
            </div>

            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">or sign up with email</span>
              <span className="auth-divider-line" />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="auth-field">
                <label className="auth-label">Name</label>
                <input
                  type="text"
                  className="auth-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <input
                  type="password"
                  className="auth-input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                />
              </div>

              <button
                type="submit"
                disabled={anyLoading}
                className="auth-primary-btn"
              >
                {loading
                  ? "Creating account..."
                  : socialLoading
                  ? "Connecting..."
                  : "Start your adventure"}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link
                to="/login"
                state={
                  from || fromGuestBook ? { from, fromGuestBook } : undefined
                }
                className="auth-link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT : same video hero */}
        <div className="auth-panel auth-right">
          <div className="auth-video-shell">
            <video className="auth-video" autoPlay loop muted playsInline>
              <source src="videos/auth_video.mp4" type="video/mp4" />
            </video>

            <div className="auth-video-overlay">
              <div className="auth-video-rooms">
                <div className="auth-room-chip">
                  <span className="auth-room-thumb auth-room-thumb-1" />
                  <span className="auth-room-label">Sunrise King 1102</span>
                </div>
                <div className="auth-room-chip">
                  <span className="auth-room-thumb auth-room-thumb-2" />
                  <span className="auth-room-label">Lagoon Villa 07</span>
                </div>
                <div className="auth-room-chip">
                  <span className="auth-room-thumb auth-room-thumb-3" />
                  <span className="auth-room-label">Skyline Rooftop</span>
                </div>
              </div>

              <div className="auth-video-textblock">
                <p className="auth-video-eyebrow">Member rates, always on.</p>
                <h2 className="auth-video-title">
                  Book smarter, sleep
                  <br />
                  <span>closer to the sea.</span>
                </h2>
                <p className="auth-video-sub">
                  Create your Moonlight account to unlock flexible bookings,
                  room upgrades and perks on every stay.
                </p>

                <div className="auth-video-tags">
                  <span className="auth-tag">Members-only prices</span>
                  <span className="auth-tag">Late checkout</span>
                  <span className="auth-tag">Room upgrades</span>
                </div>
              </div>
            </div>

            <div className="auth-video-footer-pills">
              <span className="auth-video-footer-pill">Oceanfront Wing</span>
              <span className="auth-video-footer-pill">Garden Suites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
