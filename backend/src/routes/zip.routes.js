const express = require("express");

const protect = require("../middleware/auth.middleware");
const zipUpload = require("../middleware/zip-upload.middleware");

const {
  uploadProjectZip,
} = require("../controllers/zip.controller");

const router = express.Router();

router.post(
  "/",
  protect,
  zipUpload.single("project"),
  uploadProjectZip
);

module.exports = router;