const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  getProfile,
  updateProfile,
  changePassword,
  removeAccount,
} = require("../controllers/account.controller");

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.delete("/", removeAccount);

module.exports = router;