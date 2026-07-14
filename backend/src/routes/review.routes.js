const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  getReviews,
  getSingleReview,
  removeReview,
} = require("../controllers/review.controller");

const router = express.Router();

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews for the logged-in user
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch reviews
 */
router.get("/", protect, getReviews);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review fetched successfully
 *       400:
 *         description: Invalid review ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Failed to fetch review
 */
router.get("/:id", protect, getSingleReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID
 *     description: Deletes the review and its associated findings.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       400:
 *         description: Invalid review ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Failed to delete review
 */
router.delete("/:id", protect, removeReview);

module.exports = router;