const prisma = require("../config/prisma");

const createProject = async (userId, data) => {
  return await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      language: data.language,
      userId,
    },
  });
};

const getProjects = async (userId) => {
  return await prisma.project.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
const deleteProject = async (userId, projectId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.project.delete({
    where: {
      id: projectId,
    },
  });
};

const updateProject = async (userId, projectId, data) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      title: data.title,
      description: data.description,
      language: data.language,
    },
  });
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};