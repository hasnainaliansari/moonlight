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
 * Public endpoint – room detail page ke liye
 * GET /api/reviews/public/:roomId
 */
router.get("/public/:roomId", getPublicReviewsByRoom);

// --------------------------------------------------
// Neeche waale routes ke liye auth required
// --------------------------------------------------
router.use(protect);

// Guest – create + apni reviews
router.post("/", createReview);
router.get("/my", getMyReviews);

// Admin / staff – saari reviews, moderation
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
