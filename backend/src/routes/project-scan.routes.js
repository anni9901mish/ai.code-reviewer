const express = require("express");

const {
  getScans,
  getScan,
  removeScan,
} = require("../controllers/project-scan.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getScans);
router.get("/:id", getScan);
router.delete("/:id", removeScan);

module.exports = router;