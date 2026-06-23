const fs = require("fs/promises");

async function removeFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Unable to delete temporary file ${filePath}:`, error.message);
    }
  }
}

module.exports = { removeFile };
