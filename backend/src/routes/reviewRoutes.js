const express = require("express");
const {
  createReview,
  getMyReviews,
  getAllReviews,
  updateReviewModeration,
  getPublicReviewsByRoom,
} = require("../controllers/reviewController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Public endpoint – for room detail page
 * GET /api/reviews/public/:roomId
 */
router.get("/public/:roomId", getPublicReviewsByRoom);

// --------------------------------------------------
// Authentication required for the routes below
// --------------------------------------------------
router.use(protect);

// Guest – create review + view own reviews
router.post("/", createReview);
router.get("/my", getMyReviews);

// Admin / staff – all reviews, moderation
router.get(
  "/",
  requireRole("admin", "manager", "receptionist"),
  getAllReviews
);

router.patch(
  "/:id",
  requireRole("admin", "manager", "receptionist"),
  updateReviewModeration
);

module.exports = router;
