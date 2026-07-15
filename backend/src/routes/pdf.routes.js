const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  downloadProjectScanPdf,
} = require("../controllers/pdf.controller");

const router = express.Router();

router.get(
  "/project-scan/:scanId",
  protect,
  downloadProjectScanPdf
);

module.exports = router;