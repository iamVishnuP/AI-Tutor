const NCERT_TERMS = [
  "ncert",
  "national council of educational research and training",
  "mathematics",
  "maths",
  "class x",
  "class 10",
  "secondary school mathematics"
];

const CLASS_10_CHAPTER_TERMS = [
  "real numbers",
  "polynomials",
  "pair of linear equations",
  "quadratic equations",
  "arithmetic progressions",
  "triangles",
  "coordinate geometry",
  "trigonometry",
  "circles",
  "constructions",
  "areas related to circles",
  "surface areas and volumes",
  "statistics",
  "probability"
];

const TEXTBOOK_STRUCTURE_TERMS = [
  "chapter",
  "exercise",
  "example",
  "theorem",
  "figure",
  "solution",
  "questions",
  "introduction"
];

const MATH_TERMS = [
  "find",
  "solve",
  "prove",
  "show",
  "calculate",
  "determine",
  "evaluate",
  "simplify",
  "equation",
  "polynomial",
  "quadratic",
  "linear",
  "triangle",
  "circle",
  "radius",
  "diameter",
  "area",
  "volume",
  "mean",
  "median",
  "mode",
  "probability",
  "coordinate",
  "graph",
  "root",
  "zero",
  "factor",
  "ratio",
  "angle",
  "tangent",
  "sin",
  "cos",
  "tan",
  "ap",
  "arithmetic progression"
];

const INVALID_SMALL_TALK = [
  "hi",
  "hello",
  "hey",
  "how are you",
  "good morning",
  "good evening",
  "thanks",
  "thank you",
  "ok",
  "okay",
  "test"
];

function normalize(text) {
  return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function countMatches(text, terms) {
  return terms.reduce((count, term) => (text.includes(term) ? count + 1 : count), 0);
}

function hasMathSignal(text) {
  return (
    countMatches(text, MATH_TERMS) > 0 ||
    /\d/.test(text) ||
    /[=+\-*/^]/.test(text) ||
    /\b[a-z]\s*[=<>]\s*-?\d/.test(text)
  );
}

function hasQuestionMathSignal(text) {
  return (
    countMatches(text, MATH_TERMS) > 0 ||
    /[=+\-*/^]/.test(text) ||
    /\b[a-z]\s*[=<>]\s*-?\d/.test(text) ||
    /\b\d+(st|nd|rd|th)?\s+(term|terms|number|numbers|side|sides|angle|angles)\b/.test(text)
  );
}

function looksLikeSmallTalk(text) {
  const compact = normalize(text).replace(/[?.!,]/g, "");
  return INVALID_SMALL_TALK.some((phrase) => compact === phrase || compact.startsWith(`${phrase} `));
}

function looksLikeGibberish(text) {
  const compact = normalize(text);
  const letters = compact.replace(/[^a-z]/g, "");
  const alphaNumeric = compact.replace(/[^a-z0-9]/g, "");

  if (!compact) return true;
  if (looksLikeSmallTalk(compact)) return true;
  if (alphaNumeric.length < 3) return true;
  if (/^(.)\1{3,}$/.test(alphaNumeric)) return true;

  const symbolCount = compact.replace(/[a-z0-9\s=+\-*/^().,?:]/g, "").length;
  if (symbolCount / Math.max(compact.length, 1) > 0.25) return true;
  if (letters.length >= 5 && !/[aeiou]/.test(letters)) return true;

  const tokens = compact.split(/\s+/).filter(Boolean);
  const randomTokens = tokens.filter((token) => {
    const clean = token.replace(/[^a-z0-9]/g, "");
    return clean.length >= 5 && !/[aeiou]/.test(clean) && !/\d/.test(clean);
  });

  return randomTokens.length > 0 && randomTokens.length >= Math.ceil(tokens.length / 2);
}

function validateNcertMathPdf(pdfText) {
  const text = normalize(pdfText.slice(0, 120000));
  const readableCharacters = text.replace(/\s/g, "").length;
  const ncertScore = countMatches(text, NCERT_TERMS);
  const chapterScore = countMatches(text, CLASS_10_CHAPTER_TERMS);
  const mathScore = countMatches(text, MATH_TERMS);
  const structureScore = countMatches(text, TEXTBOOK_STRUCTURE_TERMS);
  const hasExercises = /\bexercise\s+\d+(\.\d+)?\b/.test(text);
  const hasExamples = /\bexample\s+\d+\b/.test(text);
  const hasNcertIdentity =
    ncertScore >= 1 || text.includes("national council of educational research");
  const hasClass10MathIdentity =
    /class\s*(x|10)\b/.test(text) ||
    /standard\s*(x|10)\b/.test(text) ||
    text.includes("secondary school mathematics") ||
    text.includes("mathematics");

  if (readableCharacters < 1500) {
    return {
      isValid: false,
      reason:
        "The uploaded PDF does not contain enough readable textbook text. Please upload a text-based NCERT Class 10 Mathematics PDF."
    };
  }

  const hasStrongMathTextbookSignal =
    chapterScore >= 2 || mathScore >= 6 || hasExercises || hasExamples;
  const hasTextbookStructure = structureScore >= 2 || hasExercises || hasExamples;

  if (!hasNcertIdentity || !hasClass10MathIdentity || !hasStrongMathTextbookSignal || !hasTextbookStructure) {
    return {
      isValid: false,
      reason:
        "Unsupported PDF. Please upload the NCERT Class 10 Mathematics textbook, not a story book, notes, or unrelated document."
    };
  }

  return { isValid: true };
}

function validateQuestionInput(question) {
  const text = normalize(question);

  if (looksLikeGibberish(text)) {
    return {
      isValid: false,
      reason:
        "Invalid question. Please enter or upload a proper CBSE Class 10 Mathematics question."
    };
  }

  if (text.length < 12 || !hasQuestionMathSignal(text)) {
    return {
      isValid: false,
      reason:
        "The question does not appear to be a valid mathematics question. Please provide a complete question from the textbook or exam."
    };
  }

  return { isValid: true };
}

function validateAnswerInput(answer) {
  const text = normalize(answer);

  if (looksLikeGibberish(text)) {
    return {
      isValid: false,
      reason:
        "Invalid answer. Please enter or upload a meaningful mathematical answer, not random text."
    };
  }

  const hasEquationLikeAnswer = /\b[a-z]\s*[=<>]\s*-?\d/.test(text) || /\d+\s*[=+\-*/^]\s*\d+/.test(text);

  if ((!hasMathSignal(text) && !hasEquationLikeAnswer) || text.length < 5) {
    return {
      isValid: false,
      reason:
        "The answer does not appear to contain mathematical work. Please provide your solution steps or final mathematical answer."
    };
  }

  return { isValid: true };
}

module.exports = {
  validateNcertMathPdf,
  validateQuestionInput,
  validateAnswerInput
};
