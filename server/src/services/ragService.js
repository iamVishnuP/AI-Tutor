const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "in", "is", "it", "of", "on", "or", "that", "the", "this",
  "to", "was", "with", "given"
]);

const SYNONYMS = {
  "show": "prove",
  "demonstrate": "prove",
  "establish": "prove",
  "determine": "find"
};

const SUPERSCRIPT_MAP = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "ⁿ": "n", "ˣ": "x", "ʸ": "y"
};

function normalizeMath(text) {
  let normalized = (text || "").toLowerCase();
  for (const [sup, normal] of Object.entries(SUPERSCRIPT_MAP)) {
    normalized = normalized.split(sup).join(normal);
  }
  normalized = normalized.replace(/√/g, "sqrt ");
  return normalized;
}

function stringSimilarity(str1, str2) {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;
  
  const bg1 = new Set();
  for (let i = 0; i < str1.length - 1; i++) bg1.add(str1.slice(i, i + 2));
  
  const bg2 = new Set();
  for (let i = 0; i < str2.length - 1; i++) bg2.add(str2.slice(i, i + 2));
  
  let intersection = 0;
  for (const bg of bg1) {
    if (bg2.has(bg)) intersection++;
  }
  return (2.0 * intersection) / (bg1.size + bg2.size);
}

function tokenize(value) {
  return normalizeMath(value)
    .replace(/[^a-z0-9+\-*/=().\s]/g, " ")
    .split(/\s+/)
    .map(term => SYNONYMS[term] || term)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

function scoreChunk(chunk, queryTerms) {
  const chunkTerms = [...new Set(tokenize(chunk.text))];
  let score = 0;

  for (const qTerm of queryTerms) {
    let bestMatch = 0;
    for (const cTerm of chunkTerms) {
      if (qTerm === cTerm) {
        bestMatch = 1;
        break;
      } else {
        const sim = stringSimilarity(qTerm, cTerm);
        if (sim > bestMatch) bestMatch = sim;
      }
    }
    
    if (bestMatch >= 0.7) {
      score += bestMatch;
      if (/[0-9=+\-*/()]/.test(qTerm)) {
        score += 1;
      }
    }
  }

  return score;
}

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

function retrieveRelevantContext(chunks, query, topK = 5) {
  const queryTerms = [...new Set(tokenize(query))];
  if (!queryTerms.length) {
    return { 
      context: chunks.slice(0, Math.min(topK, chunks.length)).map(c => `[Chunk ${c.id}]\n${c.text}`).join("\n\n"), 
      isConfident: false, 
      score: 0 
    };
  }

  const ranked = chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, queryTerms) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (!ranked.length) {
    return { context: "", isConfident: false, score: 0 };
  }

  const maxScore = ranked[0].score;
  const confidenceThreshold = queryTerms.length * 0.3;
  const isConfident = maxScore >= confidenceThreshold;

  const context = ranked
    .map((chunk) => `[Chunk ${chunk.id}]\n${chunk.text}`)
    .join("\n\n");

  return { context, isConfident, score: maxScore };
}

module.exports = { chunkText, retrieveRelevantContext };
