const express = require("express");
const upload = require("../middleware/upload");
const asyncHandler = require("../utils/asyncHandler");
const { HttpError } = require("../utils/errors");
const { removeFile } = require("../services/fileService");
const { extractPdfText } = require("../services/pdfService");
const { extractImageText } = require("../services/ocrService");
const { chunkText, retrieveRelevantContext } = require("../services/ragService");
const { createSession, getSession, updateSession } = require("../services/sessionStore");
const { buildEvaluationPrompt } = require("../services/promptService");
const { evaluateAnswer } = require("../services/llmService");
const {
  validateNcertMathPdf,
  validateQuestionInput,
  validateAnswerInput
} = require("../services/validationService");

const router = express.Router();

function requireSession(sessionId) {
  const session = getSession(sessionId);
  if (!session) {
    throw new HttpError(404, "Session not found or expired. Please upload the PDF again.");
  }
  return session;
}

router.post(
  "/pdf",
  upload.single("pdf"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "Please upload your NCERT Mathematics textbook PDF.");
    }

    if (req.file.mimetype !== "application/pdf") {
      await removeFile(req.file.path);
      throw new HttpError(400, "The textbook upload must be a PDF.");
    }

    try {
      const pdfText = await extractPdfText(req.file.path);
      const pdfValidation = validateNcertMathPdf(pdfText);
      if (!pdfValidation.isValid) {
        throw new HttpError(400, pdfValidation.reason);
      }

      const chunks = chunkText(pdfText);
      const session = createSession({ pdfText, chunks });

      res.json({
        sessionId: session.sessionId,
        message: "PDF uploaded successfully. Please upload your question as text or image.",
        stats: {
          characters: pdfText.length,
          chunks: chunks.length
        }
      });
    } finally {
      await removeFile(req.file.path);
    }
  })
);

router.post(
  "/question",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const session = requireSession(sessionId);

    let question = (req.body.questionText || "").trim();

    try {
      if (req.file) {
        question = await extractImageText(req.file.path);
      }

      if (!question) {
        throw new HttpError(400, "Please type a question or upload an image of the question.");
      }

      const questionValidation = validateQuestionInput(question);
      if (!questionValidation.isValid) {
        throw new HttpError(400, questionValidation.reason);
      }

      const questionContext = retrieveRelevantContext(session.chunks, question, 3);
      if (!questionContext) {
        throw new HttpError(
          400,
          "This question does not appear to match the uploaded NCERT Mathematics textbook context. Please upload a valid textbook question."
        );
      }

      updateSession(sessionId, { question });

      res.json({
        question,
        message: "Question received. Please upload or type your answer."
      });
    } finally {
      await removeFile(req.file?.path);
    }
  })
);

router.post(
  "/evaluate",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const session = requireSession(sessionId);

    if (!session.question) {
      throw new HttpError(400, "Please submit the question before submitting the answer.");
    }

    let answer = (req.body.answerText || "").trim();

    try {
      if (req.file) {
        answer = await extractImageText(req.file.path);
      }

      if (!answer) {
        throw new HttpError(400, "Please type an answer or upload an answer image.");
      }

      const answerValidation = validateAnswerInput(answer);
      if (!answerValidation.isValid) {
        throw new HttpError(400, answerValidation.reason);
      }

      const query = `${session.question}\n${answer}`;
      const context = retrieveRelevantContext(session.chunks, query);
      if (!context) {
        throw new HttpError(
          400,
          "Unable to find relevant NCERT context for this question and answer. Please check that both inputs belong to the uploaded textbook."
        );
      }

      const prompt = buildEvaluationPrompt({
        question: session.question,
        answer,
        context
      });
      const evaluation = await evaluateAnswer(prompt);

      updateSession(sessionId, { answer });

      res.json({
        answer,
        contextFound: Boolean(context),
        evaluation
      });
    } finally {
      await removeFile(req.file?.path);
    }
  })
);

module.exports = router;
