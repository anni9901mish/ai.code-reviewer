const path = require("path");
const fs = require("fs-extra");
const simpleGit = require("simple-git");
const { randomUUID } = require("crypto");

const githubRoot = path.join(
  process.cwd(),
  "src",
  "uploads",
  "github"
);

const validateGithubUrl = (repositoryUrl) => {
  try {
    const url = new URL(repositoryUrl);

    if (
      url.hostname !== "github.com" &&
      url.hostname !== "www.github.com"
    ) {
      return false;
    }

    const pathParts = url.pathname
      .split("/")
      .filter(Boolean);

    return pathParts.length >= 2;
  } catch {
    return false;
  }
};

const getRepositoryName = (repositoryUrl) => {
  const url = new URL(repositoryUrl);

  const pathParts = url.pathname
    .split("/")
    .filter(Boolean);

  return pathParts[1].replace(/\.git$/i, "");
};

const cloneRepository = async (repositoryUrl) => {
  if (!validateGithubUrl(repositoryUrl)) {
    const error = new Error("Invalid GitHub repository URL");
    error.statusCode = 400;
    throw error;
  }

  await fs.ensureDir(githubRoot);

  const repositoryName = getRepositoryName(repositoryUrl);

  const destination = path.join(
    githubRoot,
    `${repositoryName}-${randomUUID()}`
  );

  const git = simpleGit();

  try {
    await git.clone(
      repositoryUrl,
      destination,
      [
        "--depth",
        "1",
        "--single-branch",
      ]
    );

    return {
      repositoryName,
      repositoryPath: destination,
    };
  } catch (error) {
    await fs.remove(destination);

    const cloneError = new Error(
      error.message || "Failed to clone GitHub repository"
    );

    cloneError.statusCode = 400;

    throw cloneError;
  }
};

const deleteRepository = async (repositoryPath) => {
  if (!repositoryPath) {
    return;
  }

  await fs.remove(repositoryPath);
};

module.exports = {
  validateGithubUrl,
  getRepositoryName,
  cloneRepository,
  deleteRepository,
};