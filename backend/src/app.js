const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const uploadRoutes = require("./routes/upload.routes");
const reviewRoutes = require("./routes/review.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const zipRoutes = require("./routes/zip.routes");
const projectScanRoutes = require("./routes/project-scan.routes");
const githubRoutes = require("./routes/github.routes");
const pdfRoutes = require("./routes/pdf.routes");
const accountRoutes = require("./routes/account.routes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-code-reviewer-ten-tau.vercel.app",
  "https://ai-code-reviewer-git-main-anni9901mishs-projects.vercel.app",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowedOrigin =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app");

    if (isAllowedOrigin) {
      return callback(null, true);
    }

    const error = new Error(
      `CORS blocked request from origin: ${origin}`
    );

    error.statusCode = 403;

    return callback(error);
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "AI Code Review API Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use("/api/upload/project", zipRoutes);
app.use("/api/project-scans", projectScanRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/account", accountRoutes);

app.use((error, req, res, next) => {
  console.error("EXPRESS ERROR:", error);

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;