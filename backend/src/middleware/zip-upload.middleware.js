const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
  process.cwd(),
  "src",
  "uploads",
  "zips"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const safeName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    callback(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  console.log("ZIP UPLOAD FILE:", {
    originalName: file.originalname,
    extension,
    mimeType: file.mimetype,
  });

  if (extension !== ".zip") {
    return callback(
      new Error(
        `Only ZIP files are allowed. Received: ${file.originalname}`
      )
    );
  }

  return callback(null, true);
};

const zipUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = zipUpload;