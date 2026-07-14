const {
  getUserReviews,
  getReviewById,
} = require("../services/review.service");

const getReviews = async (req, res) => {
  try {
    const reviews = await getUserReviews(req.user.id);

    return res.json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.log("GET REVIEWS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch reviews",
    });
  }
};

const getSingleReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.id);

    if (!reviewId) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await getReviewById(req.user.id, reviewId);

    return res.json(review);
  } catch (error) {
    console.log("GET REVIEW ERROR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to fetch review",
    });
  }
};

const { deleteReview } = require("../services/review.service");

const removeReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.id);

    if (!reviewId) {
      return res.status(400).json({
        message: "Invalid review id",
      });
    }

    await deleteReview(req.user.id, reviewId);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("DELETE REVIEW ERROR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to delete review",
    });
  }
};

module.exports = {
  getReviews,
  getSingleReview,
  removeReview,
};