// src/pages/GuestProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/guest.css";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function GuestProfile() {
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null); // { user, guest, bookings, reviews }

  // ----- forms: details -----
  const [detailsForm, setDetailsForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    preferences: "",
  });
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState("");

  // ----- forms: password -----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // ----- reviews form -----
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // ✅ NEW: Maintenance request form (guest)
  const [issueType, setIssueType] = useState("ac");
  const [issueNotes, setIssueNotes] = useState("");
  const [issuePriority, setIssuePriority] = useState("normal");
  const [issuePhotoUrl, setIssuePhotoUrl] = useState("");
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [issueMessage, setIssueMessage] = useState("");

  // Load profile from API
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/profile/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Load profile error", err);
        setError(
          err?.response?.data?.message || "Unable to load profile right now."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user]);

  // When the profile loads, populate the details form.
  useEffect(() => {
    if (!profile || !profile.user) return;

    const guest = profile.guest || {};
    setDetailsForm({
      fullName: guest.fullName || profile.user.name || "",
      phone: guest.phone || "",
      address: guest.address || "",
      city: guest.city || "",
      country: guest.country || "",
      preferences: guest.preferences || "",
    });
  }, [profile]);

  const bookings = profile?.bookings || [];
  const reviews = profile?.reviews || [];
  const guestData = profile?.guest || null;

  const now = new Date();

  const currentBooking = useMemo(() => {
    return bookings.find((b) => {
      const inDate = new Date(b.checkInDate);
      const outDate = new Date(b.checkOutDate);
      return inDate <= now && outDate >= now;
    });
  }, [bookings, now]);

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => new Date(b.checkInDate) > now),
    [bookings, now]
  );

  const pastBookings = useMemo(
    () => bookings.filter((b) => new Date(b.checkOutDate) < now),
    [bookings, now]
  );

  const pastBookingsOptions = pastBookings;

  // ---------- NOT LOGGED IN VIEW ----------
  if (!isAuthenticated || !user) {
    return (
      <div className="g-guest-profile-page">
        <div className="g-guest-profile-card">
          <h1 className="g-guest-profile-title">Guest profile</h1>
          <p className="g-guest-profile-sub">
            Sign in to view your stays, booking history and share feedback
            about Moonlight.
          </p>

          <div className="g-guest-profile-actions">
            <button
              type="button"
              className="g-book-btn g-book-btn-lg"
              onClick={() =>
                navigate("/login", {
                  state: { from: "/guest/profile", fromGuestBook: true },
                })
              }
            >
              Sign in
            </button>
            <button
              type="button"
              className="g-ghost-btn"
              onClick={() =>
                navigate("/signup", {
                  state: { from: "/guest/profile", fromGuestBook: true },
                })
              }
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- LOADING ----------
  if (loading && !profile) {
    return (
      <div className="g-guest-profile-page">
        <div className="g-guest-profile-card">Loading your profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="g-guest-profile-page">
        <div className="g-guest-profile-card g-guest-profile-error">
          {error}
        </div>
      </div>
    );
  }

  const profileUser = profile?.user || user;
  const firstName = profileUser?.name
    ? profileUser.name.split(" ")[0]
    : "Guest";

  // ----- handlers -----
  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetailsForm((f) => ({ ...f, [name]: value }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setDetailsMessage("");
    setSavingDetails(true);

    try {
      const payload = {
        name: detailsForm.fullName,
        phone: detailsForm.phone,
        address: detailsForm.address,
        city: detailsForm.city,
        country: detailsForm.country,
        preferences: detailsForm.preferences,
      };

      const res = await api.patch("/profile/me", payload);
      setProfile(res.data);

      if (res.data?.user) {
        setUser((prev) =>
          prev
            ? { ...prev, name: res.data.user.name, email: res.data.user.email }
            : prev
        );
      }

      setDetailsMessage("Your details have been updated.");
    } catch (err) {
      console.error("Update details error", err);
      setDetailsMessage(
        err?.response?.data?.message || "Couldn't update your details."
      );
    } finally {
      setSavingDetails(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/profile/change-password", {
        currentPassword,
        newPassword,
      });
      setPasswordMessage("Your password has been updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error", err);
      setPasswordMessage(
        err?.response?.data?.message || "Unable to update password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    if (!selectedBookingId) {
      setReviewMessage("Please select a stay to review.");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        bookingId: selectedBookingId,
        rating,
        comment,
      });

      setReviewMessage("Thank you! Your review has been submitted.");
      setComment("");
      setRating(5);
      setSelectedBookingId("");

      const res = await api.get("/profile/me");
      setProfile(res.data);
    } catch (err) {
      console.error("Create review error", err);
      setReviewMessage(
        err?.response?.data?.message ||
          "Unable to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // ✅ NEW: Submit maintenance issue
  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    setIssueMessage("");

    if (!currentBooking) {
      setIssueMessage("You can report an issue only during an active stay.");
      return;
    }

    const roomId = currentBooking?.room?._id;
    const bookingId = currentBooking?._id;

    if (!roomId || !bookingId) {
      setIssueMessage("Unable to detect your current room/booking.");
      return;
    }

    const issueTypeLabel =
      issueType === "ac"
        ? "AC not working"
        : issueType === "plumbing"
        ? "Plumbing issue"
        : issueType === "electric"
        ? "Electrical issue"
        : issueType === "wifi"
        ? "Wi-Fi / Internet issue"
        : issueType === "tv"
        ? "TV / Remote issue"
        : issueType === "noise"
        ? "Noise complaint"
        : "Other issue";

    setSubmittingIssue(true);
    try {
      await api.post("/maintenance/requests", {
        roomId,
        bookingId,
        issue: issueTypeLabel,
        notes: issueNotes || "",
        priority: issuePriority,
        photoUrl: issuePhotoUrl || "",
      });

      setIssueMessage("Thanks! Your request has been submitted.");
      setIssueNotes("");
      setIssuePriority("normal");
      setIssuePhotoUrl("");
      setIssueType("ac");
    } catch (err) {
      console.error("Submit maintenance request error", err);
      setIssueMessage(
        err?.response?.data?.message || "Unable to submit request right now."
      );
    } finally {
      setSubmittingIssue(false);
    }
  };

  return (
    <div className="g-guest-profile-page">
      {/* Top summary + logout */}
      <section className="g-guest-profile-card">
        <div className="g-guest-profile-header">
          <div className="g-guest-profile-avatar-lg">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="g-guest-profile-title">
              Welcome back, {firstName}
            </h1>
            <p className="g-guest-profile-sub">
              View your current stay, upcoming trips and booking history at
              Moonlight Resort &amp; Suites.
            </p>
          </div>

          <button
            type="button"
            className="g-guest-logout-btn"
            onClick={logout}
          >
            Log out
          </button>
        </div>

        <div className="g-guest-profile-meta">
          <div className="g-guest-profile-meta-item">
            <span className="g-meta-label">Name</span>
            <span className="g-meta-value">{profileUser?.name}</span>
          </div>
          <div className="g-guest-profile-meta-item">
            <span className="g-meta-label">Email</span>
            <span className="g-meta-value">{profileUser?.email}</span>
          </div>
          <div className="g-guest-profile-meta-item">
            <span className="g-meta-label">Member since</span>
            <span className="g-meta-value">
              {formatDate(profileUser?.createdAt)}
            </span>
          </div>
          <div className="g-guest-profile-meta-item">
            <span className="g-meta-label">VIP status</span>
            <span className="g-meta-value">
              {guestData?.isVIP
                ? "VIP member – personalised stays unlocked."
                : "Standard guest – subscribe to become a VIP member."}
            </span>
          </div>
        </div>
      </section>

      {/* Account details + password */}
      <section className="g-guest-profile-grid">
        {/* Details form */}
        <div className="g-room-block">
          <h2 className="g-room-subtitle">Account details</h2>
          <form onSubmit={handleSaveDetails} className="g-account-form">
            <div className="g-account-field">
              <label className="g-meta-label">Full name</label>
              <input
                className="g-review-input"
                name="fullName"
                value={detailsForm.fullName}
                onChange={handleDetailsChange}
                placeholder="Your name"
              />
            </div>

            <div className="g-account-field">
              <label className="g-meta-label">Phone</label>
              <input
                className="g-review-input"
                name="phone"
                value={detailsForm.phone}
                onChange={handleDetailsChange}
                placeholder="+1 555 000 0000"
              />
            </div>

            <div className="g-account-field">
              <label className="g-meta-label">Address</label>
              <input
                className="g-review-input"
                name="address"
                value={detailsForm.address}
                onChange={handleDetailsChange}
                placeholder="Street address"
              />
            </div>

            <div className="g-account-inline">
              <div className="g-account-field">
                <label className="g-meta-label">City</label>
                <input
                  className="g-review-input"
                  name="city"
                  value={detailsForm.city}
                  onChange={handleDetailsChange}
                />
              </div>
              <div className="g-account-field">
                <label className="g-meta-label">Country</label>
                <input
                  className="g-review-input"
                  name="country"
                  value={detailsForm.country}
                  onChange={handleDetailsChange}
                />
              </div>
            </div>

            <div className="g-account-field">
              <label className="g-meta-label">Preferences</label>
              <textarea
                className="g-review-input"
                rows={3}
                name="preferences"
                value={detailsForm.preferences}
                onChange={handleDetailsChange}
                placeholder="Room temperature, pillow type, dietary needs…"
              />
            </div>

            {detailsMessage && (
              <div className="g-review-message">{detailsMessage}</div>
            )}

            <button
              type="submit"
              className="g-book-btn g-book-btn-lg g-review-submit"
              disabled={savingDetails}
            >
              {savingDetails ? "Saving…" : "Save details"}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="g-room-block">
          <h2 className="g-room-subtitle">Security</h2>
          <form onSubmit={handleChangePassword} className="g-account-form">
            <div className="g-account-field">
              <label className="g-meta-label">Current password</label>
              <input
                className="g-review-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="g-account-field">
              <label className="g-meta-label">New password</label>
              <input
                className="g-review-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="g-account-field">
              <label className="g-meta-label">Confirm new password</label>
              <input
                className="g-review-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {passwordMessage && (
              <div className="g-review-message">{passwordMessage}</div>
            )}

            <button
              type="submit"
              className="g-book-btn g-book-btn-lg g-review-submit"
              disabled={changingPassword}
            >
              {changingPassword ? "Updating…" : "Change password"}
            </button>
          </form>
        </div>
      </section>

      {/* Current + upcoming */}
      <section className="g-guest-profile-grid">
        <div className="g-room-block">
          <h2 className="g-room-subtitle">Current stay</h2>
          {currentBooking ? (
            <BookingSummary booking={currentBooking} highlight />
          ) : (
            <p className="g-room-text-muted">
              You don&apos;t have an active stay right now. Any upcoming trips
              will appear below.
            </p>
          )}
        </div>

        <div className="g-room-block">
          <h2 className="g-room-subtitle">Upcoming trips</h2>
          {upcomingBookings.length === 0 ? (
            <p className="g-room-text-muted">
              No upcoming bookings yet. Use the <b>Book Now</b> button to plan
              your next visit.
            </p>
          ) : (
            <div className="g-guest-booking-list">
              {upcomingBookings.map((b) => (
                <BookingSummary key={b._id} booking={b} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ NEW: Report an issue (Guest) */}
      <section className="g-guest-profile-grid">
        <div className="g-room-block">
          <h2 className="g-room-subtitle">Report an issue</h2>

          {!currentBooking ? (
            <p className="g-room-text-muted">
              You can report maintenance issues only during an active stay.
              If you are not checked in, this option will appear once your stay begins.
            </p>
          ) : (
            <form onSubmit={handleSubmitIssue} className="g-review-form">
              <div className="g-review-field">
                <label className="g-meta-label">Current room</label>
                <div className="g-review-input" style={{ display: "flex", alignItems: "center" }}>
                  #{currentBooking.room?.roomNumber} ({currentBooking.room?.type})
                </div>
              </div>

              <div className="g-review-field">
                <label className="g-meta-label">Issue type</label>
                <select
                  className="g-review-input"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option value="ac">AC not working</option>
                  <option value="plumbing">Plumbing issue</option>
                  <option value="electric">Electrical issue</option>
                  <option value="wifi">Wi-Fi / Internet issue</option>
                  <option value="tv">TV / Remote issue</option>
                  <option value="noise">Noise complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="g-review-field">
                <label className="g-meta-label">Priority</label>
                <select
                  className="g-review-input"
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="g-review-field">
                <label className="g-meta-label">Notes (optional)</label>
                <textarea
                  className="g-review-input"
                  rows={3}
                  placeholder="Describe the issue (e.g. AC making noise, not cooling after 30 minutes)..."
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                />
              </div>

              <div className="g-review-field">
                <label className="g-meta-label">Photo URL (optional)</label>
                <input
                  className="g-review-input"
                  placeholder="https://..."
                  value={issuePhotoUrl}
                  onChange={(e) => setIssuePhotoUrl(e.target.value)}
                />
              </div>

              {issueMessage && <div className="g-review-message">{issueMessage}</div>}

              <button
                type="submit"
                className="g-book-btn g-book-btn-lg g-review-submit"
                disabled={submittingIssue}
              >
                {submittingIssue ? "Submitting..." : "Submit request"}
              </button>
            </form>
          )}
        </div>

        <div className="g-room-block">
          <h2 className="g-room-subtitle">Tips</h2>
          <p className="g-room-text-muted">
            For urgent issues, please contact the front desk as well.
            Maintenance requests are tracked and assigned to the team automatically.
          </p>
        </div>
      </section>

      {/* History + reviews */}
      <section className="g-guest-profile-grid">
        {/* Booking history table */}
        <div className="g-room-block">
          <h2 className="g-room-subtitle">Booking history</h2>
          {bookings.length === 0 ? (
            <p className="g-room-text-muted">
              Once you book a room, your full history will appear here.
            </p>
          ) : (
            <div className="g-guest-history-table">
              <div className="g-guest-history-header">
                <span>Dates</span>
                <span>Room</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              {bookings.map((b) => (
                <div key={b._id} className="g-guest-history-row">
                  <span>
                    {formatDate(b.checkInDate)} – {formatDate(b.checkOutDate)}
                  </span>
                  <span>
                    #{b.room?.roomNumber} ({b.room?.type})
                  </span>
                  <span className={`g-chip g-chip-${b.status}`}>
                    {b.status}
                  </span>
                  <span>${b.totalPrice?.toFixed?.(0) ?? b.totalPrice}</span>
                </div>
              ))}
            </div>
          )}

          <p className="g-room-text-muted" style={{ marginTop: 10 }}>
            Invoices are emailed to you after checkout. Keep those emails safe
            for your records.
          </p>
        </div>

        {/* Review form + your reviews */}
        <div className="g-room-block">
          <h2 className="g-room-subtitle">Share your feedback</h2>
          {pastBookingsOptions.length === 0 ? (
            <p className="g-room-text-muted">
              After you complete a stay, you&apos;ll be able to leave a review
              here.
            </p>
          ) : (
            <form onSubmit={handleSubmitReview} className="g-review-form">
              <div className="g-review-field">
                <label className="g-meta-label">
                  Which stay would you like to review?
                </label>
                <select
                  className="g-review-input"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                >
                  <option value="">Select a past stay</option>
                  {pastBookingsOptions.map((b) => (
                    <option key={b._id} value={b._id}>
                      #{b.room?.roomNumber} • {b.room?.type} •{" "}
                      {formatDate(b.checkInDate)} –{" "}
                      {formatDate(b.checkOutDate)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="g-review-field">
                <label className="g-meta-label">Rating</label>
                <div className="g-rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={
                        "g-rating-star" +
                        (star <= rating ? " g-rating-star-active" : "")
                      }
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="g-review-field">
                <label className="g-meta-label">Comments (optional)</label>
                <textarea
                  className="g-review-input"
                  rows={4}
                  placeholder="Tell us about your stay – what you loved, and what we can improve."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {reviewMessage && (
                <div className="g-review-message">{reviewMessage}</div>
              )}

              <button
                type="submit"
                className="g-book-btn g-book-btn-lg g-review-submit"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit review"}
              </button>
            </form>
          )}

          {reviews.length > 0 && (
            <div className="g-review-list">
              <h3 className="g-room-subtitle" style={{ marginTop: 18 }}>
                Your reviews
              </h3>
              {reviews.map((r) => (
                <div key={r._id} className="g-review-row">
                  <div className="g-review-row-top">
                    <div>
                      <div className="g-review-room">
                        #{r.room?.roomNumber} ({r.room?.type})
                      </div>
                      <div className="g-review-date">
                        Stayed:{" "}
                        {r.booking
                          ? `${formatDate(
                              r.booking.checkInDate
                            )} – ${formatDate(r.booking.checkOutDate)}`
                          : formatDate(r.createdAt)}
                      </div>
                    </div>
                    <div className="g-review-rating-display">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && <p className="g-review-comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BookingSummary({ booking, highlight }) {
  return (
    <div
      className={
        "g-guest-booking-summary" +
        (highlight ? " g-guest-booking-current" : "")
      }
    >
      <div>
        <div className="g-guest-booking-room">
          Room #{booking.room?.roomNumber} ({booking.room?.type})
        </div>
        <div className="g-guest-booking-dates">
          {formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}
        </div>
      </div>
      <div className="g-guest-booking-meta">
        <span className={`g-chip g-chip-${booking.status}`}>
          {booking.status}
        </span>
        <span className="g-guest-booking-total">
          ${booking.totalPrice?.toFixed?.(0) ?? booking.totalPrice}
        </span>
      </div>
    </div>
  );
}

export default GuestProfile;
