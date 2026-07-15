const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  reviewGithubRepository,
} = require("../controllers/github.controller");

const router = express.Router();

router.post(
  "/review",
  protect,
  reviewGithubRepository
);

module.exports = router;