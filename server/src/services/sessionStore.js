const crypto = require("crypto");

const sessions = new Map();
const ttlMs = Number(process.env.SESSION_TTL_MINUTES || 60) * 60 * 1000;

function createSession({ pdfText, chunks }) {
  const sessionId = crypto.randomUUID();
  const now = Date.now();

  sessions.set(sessionId, {
    sessionId,
    pdfText,
    chunks,
    question: "",
    answer: "",
    createdAt: now,
    updatedAt: now
  });

  return sessions.get(sessionId);
}

function getSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) return null;

  const session = sessions.get(sessionId);
  if (Date.now() - session.updatedAt > ttlMs) {
    sessions.delete(sessionId);
    return null;
  }

  session.updatedAt = Date.now();
  return session;
}

function updateSession(sessionId, updates) {
  const session = getSession(sessionId);
  if (!session) return null;

  Object.assign(session, updates, { updatedAt: Date.now() });
  return session;
}

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.updatedAt > ttlMs) {
      sessions.delete(sessionId);
    }
  }
}, Math.min(ttlMs, 15 * 60 * 1000)).unref();

module.exports = { createSession, getSession, updateSession };
