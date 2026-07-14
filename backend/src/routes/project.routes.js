const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  createProject,
  getProjects,
  updateProject,
  removeProject,
} = require("../controllers/project.controller");

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, removeProject);

module.exports = router;