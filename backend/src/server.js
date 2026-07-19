require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 5000;

console.log("PORT from Render:", process.env.PORT);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION:", error);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});