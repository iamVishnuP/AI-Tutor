const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 25);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext.replace(/[^.\w]/g, "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Only PDF, JPG, PNG, and WebP files are allowed.");
      error.statusCode = 400;
      cb(error);
      return;
    }

    cb(null, true);
  }
});

module.exports = upload;
