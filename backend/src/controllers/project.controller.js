const projectService = require("../services/project.service");

const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(
      req.user.id,
      req.body
    );

    res.status(201).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects(req.user.id);

    res.json(projects);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!projectId) {
      return res.status(400).json({
        message: "Invalid project id",
      });
    }

    const { title, description, language } = req.body || {};

    if (!title || !language) {
      return res.status(400).json({
        message: "Title and language are required",
      });
    }

    const project = await projectService.updateProject(
      req.user.id,
      projectId,
      {
        title,
        description,
        language,
      }
    );

    return res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.log("UPDATE PROJECT ERROR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to update project",
    });
  }
};

const removeProject = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!projectId) {
      return res.status(400).json({
        message: "Invalid project id",
      });
    }

    await projectService.deleteProject(req.user.id, projectId);

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log("DELETE PROJECT ERROR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to delete project",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  removeProject,
};