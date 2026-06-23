const { createWorker } = require("tesseract.js");

async function extractImageText(filePath) {
  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(filePath);
    const text = (result.data.text || "").replace(/\s+/g, " ").trim();

    if (!text) {
      throw new Error("No readable text was found in the uploaded image.");
    }

    return text;
  } finally {
    await worker.terminate();
  }
}

module.exports = { extractImageText };
