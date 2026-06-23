const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "with",
  "find",
  "show",
  "prove",
  "given"
]);

function chunkText(text, chunkSize = 450, overlap = 80) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];

  for (let start = 0; start < words.length; start += chunkSize - overlap) {
    const slice = words.slice(start, start + chunkSize);
    if (slice.length < 30) break;

    chunks.push({
      id: chunks.length + 1,
      text: slice.join(" ")
    });
  }

  return chunks;
}

function tokenize(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+\-*/=().\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

function scoreChunk(chunk, queryTerms) {
  const text = chunk.text.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = text.match(new RegExp(`\\b${escaped}\\b`, "g"));
    if (matches) {
      score += matches.length;
    }

    if (/[=+\-*/()]/.test(term) && text.includes(term)) {
      score += 2;
    }
  }

  return score;
}

function retrieveRelevantContext(chunks, query, topK = 5) {
  const queryTerms = [...new Set(tokenize(query))];
  if (!queryTerms.length) return chunks.slice(0, Math.min(topK, chunks.length));

  const ranked = chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, queryTerms) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (!ranked.length) return "";

  return ranked
    .map((chunk) => `[Chunk ${chunk.id}]\n${chunk.text}`)
    .join("\n\n");
}

module.exports = { chunkText, retrieveRelevantContext };
