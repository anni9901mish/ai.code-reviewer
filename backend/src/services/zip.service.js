const unzipper = require("unzipper");
const fs = require("fs-extra");
const path = require("path");

const extractProject = async (
  zipFilePath,
  destination
) => {
  await fs.ensureDir(destination);

  await fs
    .createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: destination }))
    .promise();

  return destination;
};

module.exports = {
  extractProject,
};