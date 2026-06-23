const fs = require("fs/promises");
const pdfParse = require("pdf-parse");

async function extractPdfText(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  const text = (data.text || "").replace(/\s+/g, " ").trim();

  if (!text || text.length < 50) {
    throw new Error("The uploaded PDF did not contain enough extractable text.");
  }

  return text;
}

module.exports = { extractPdfText };
