import { useEffect, useState } from "react";
import api from "../services/api";

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ratingStars(n) {
  const safe = Math.max(0, Math.min(5, n || 0));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

function statusColor(status) {
  switch (status) {
    case "approved":
      return "#22c55e";
    case "rejected":
      return "#f97316";
    default:
      return "#e5e7eb";
  }
}

function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/reviews");
      const list = res.data?.reviews || res.data || [];
      setReviews(list);
    } catch (error) {
      console.error("Load reviews error", error);
      setErr(
        error?.response?.data?.message ||
          "Failed to load reviews from server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const updateReview = async (id, payload) => {
    try {
      setActionLoadingId(id);
      const res = await api.patch(`/reviews/${id}`, payload);
      const updated = res.data?.review;
      if (updated) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, ...updated } : r))
        );
      } else {
        // fallback reload
        await loadReviews();
      }
    } catch (error) {
      console.error("Update review error", error);
      alert(
        error?.response?.data?.message ||
          "Unable to update review. Please try again."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ minWidth: 0 }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Guest reviews</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        See what guests are saying about their stays at Moonlight Resort &amp;
        Suites, and control which reviews are public.
      </p>

      <div
        style={{
          padding: 14,
          borderRadius: 14,
          border: "1px solid rgba(148,163,184,0.3)",
          background:
            "radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 55%) #020617",
          minHeight: 140,
        }}
      >
        {loading && <div>Loading reviews…</div>}
        {err && !loading && (
          <div style={{ color: "#fecaca", fontSize: 13 }}>{err}</div>
        )}

        {!loading && !err && reviews.length === 0 && (
          <div style={{ fontSize: 13, color: "#9ca3af" }}>
            No reviews have been submitted yet.
          </div>
        )}

        {!loading && !err && reviews.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #1f2937",
                }}
              >
                <th style={{ padding: "8px 6px" }}>Rating</th>
                <th style={{ padding: "8px 6px" }}>Guest</th>
                <th style={{ padding: "8px 6px" }}>Room / stay</th>
                <th style={{ padding: "8px 6px" }}>Comment</th>
                <th style={{ padding: "8px 6px" }}>Status</th>
                <th style={{ padding: "8px 6px" }}>Visibility</th>
                <th style={{ padding: "8px 6px" }}>Created</th>
                <th style={{ padding: "8px 6px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => {
                const name =
                  r.guest?.fullName || r.user?.name || "Guest";
                const email = r.guest?.email || r.user?.email || "";
                const isBusy = actionLoadingId === r._id;

                return (
                  <tr
                    key={r._id}
                    style={{
                      borderBottom: "1px solid #111827",
                      verticalAlign: "top",
                    }}
                  >
                    <td style={{ padding: "6px 6px", whiteSpace: "nowrap" }}>
                      <span style={{ color: "#facc15", fontSize: 14 }}>
                        {ratingStars(r.rating)}
                      </span>
                      <span style={{ marginLeft: 4, color: "#9ca3af" }}>
                        ({r.rating || 0}/5)
                      </span>
                    </td>

                    <td style={{ padding: "6px 6px" }}>
                      <div>{name}</div>
                      {email && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          {email}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "6px 6px" }}>
                      <div>
                        Room #{r.room?.roomNumber} ({r.room?.type})
                      </div>
                      {r.booking && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          {formatDate(r.booking.checkInDate)} –{" "}
                          {formatDate(r.booking.checkOutDate)}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "6px 6px", maxWidth: 320 }}>
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          color: r.comment ? "#e5e7eb" : "#6b7280",
                        }}
                      >
                        {r.comment || "No comment provided."}
                      </div>
                    </td>

                    <td style={{ padding: "6px 6px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          background: "#0b1120",
                          border: `1px solid ${statusColor(r.status)}`,
                          color: statusColor(r.status),
                          textTransform: "capitalize",
                        }}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td style={{ padding: "6px 6px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: r.isPublic ? "#22c55e" : "#9ca3af",
                        }}
                      >
                        {r.isPublic ? "Public" : "Hidden"}
                      </span>
                    </td>

                    <td style={{ padding: "6px 6px", fontSize: 12 }}>
                      {formatDate(r.createdAt)}
                    </td>

                    <td style={{ padding: "6px 6px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateReview(r._id, { status: "approved" })
                          }
                          style={{
                            padding: "3px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(34,197,94,0.6)",
                            background: "transparent",
                            color: "#bbf7d0",
                            fontSize: 11,
                            cursor: isBusy ? "wait" : "pointer",
                          }}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateReview(r._id, {
                              status: "rejected",
                              isPublic: false,
                            })
                          }
                          style={{
                            padding: "3px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(248,113,113,0.8)",
                            background: "transparent",
                            color: "#fecaca",
                            fontSize: 11,
                            cursor: isBusy ? "wait" : "pointer",
                          }}
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateReview(r._id, { isPublic: !r.isPublic })
                          }
                          style={{
                            padding: "3px 8px",
                            borderRadius: 999,
                            border: "1px solid rgba(129,140,248,0.8)",
                            background: "transparent",
                            color: "#c7d2fe",
                            fontSize: 11,
                            cursor: isBusy ? "wait" : "pointer",
                          }}
                        >
                          {r.isPublic ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ReviewsAdmin;
