const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "AI Code Review API Running"
    });
});
app.use("/api/auth", authRoutes);
module.exports = app;