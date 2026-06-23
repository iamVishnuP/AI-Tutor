require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();
const port = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: clientOrigin.split(",").map((origin) => origin.trim()),
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-tutor-cbse-server" });
});

app.use("/api", sessionRoutes);

app.use((err, _req, res, _next) => {
  const isMulterSizeError = err.code === "LIMIT_FILE_SIZE";
  const status = isMulterSizeError ? 400 : err.statusCode || 500;
  const message =
    isMulterSizeError
      ? `Upload size must be ${process.env.MAX_UPLOAD_MB || 25}MB or less.`
      : status === 500
        ? "Something went wrong while processing your request."
        : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`AI Tutor backend listening on port ${port}`);
});
