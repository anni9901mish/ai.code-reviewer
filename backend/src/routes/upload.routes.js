const express = require("express");

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadFile } = require("../controllers/upload.controller");

const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload source code file for AI review
 *     description: Uploads a source code file, performs static analysis, generates an AI review using Gemini, and stores the review in the database.
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - projectId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               projectId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: File analyzed and AI review saved successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", protect, upload.single("file"), uploadFile);

module.exports = router;