const express = require("express");

const protect = require("../middleware/auth.middleware");
const {
  getDashboard,
} = require("../controllers/dashboard.controller");

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     description: Returns dashboard statistics for the authenticated user including projects, reviews, findings and AI review metrics.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", protect, getDashboard);

module.exports = router;