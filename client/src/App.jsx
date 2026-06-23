import React from "react";
import { BookOpenCheck, RotateCcw, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import ChatMessage from "./components/ChatMessage";
import Composer from "./components/Composer";
import EvaluationResult from "./components/EvaluationResult";
import { evaluateAnswer, submitQuestion, uploadPdf } from "./lib/api";
import { createId } from "./lib/id";

function createInitialMessages() {
  return [
    {
      id: createId(),
      sender: "assistant",
      text: "Welcome to AI Tutor. Please upload your NCERT Mathematics textbook PDF."
    }
  ];
}

const initialMessages = createInitialMessages();

function userFileMessage(file, fallback) {
  return file ? `Uploaded: ${file.name}` : fallback;
}

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [step, setStep] = useState("pdf");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const chatEndRef = useRef(null);

  function appendMessage(sender, text, title) {
    setMessages((current) => [
      ...current,
      {
        id: createId(),
        sender,
        title,
        text
      }
    ]);

    window.requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function resetSession() {
    setMessages(createInitialMessages());
    setStep("pdf");
    setSessionId("");
    setEvaluation(null);
  }

  async function handleSubmit({ text, file }) {
    setIsLoading(true);
    setEvaluation(null);

    try {
      if (step === "pdf") {
        appendMessage("user", userFileMessage(file, "PDF uploaded"));
        const data = await uploadPdf(file);
        setSessionId(data.sessionId);
        appendMessage("assistant", data.message);
        setStep("question");
        return;
      }

      if (step === "question") {
        appendMessage("user", userFileMessage(file, text), "Question");
        const data = await submitQuestion({
          sessionId,
          questionText: text,
          imageFile: file
        });
        appendMessage("assistant", data.message);
        setStep("answer");
        return;
      }

      if (step === "answer") {
        appendMessage("user", userFileMessage(file, text), "Answer");
        const data = await evaluateAnswer({
          sessionId,
          answerText: text,
          imageFile: file
        });
        appendMessage(
          "assistant",
          data.contextFound
            ? "Evaluation complete. Here is the strict CBSE-style result."
            : "Evaluation complete, but no strong matching context was found in the uploaded PDF."
        );
        setEvaluation(data.evaluation);
        setStep("done");
      }
    } catch (error) {
      appendMessage("assistant", error.message, "Error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-bg flex min-h-screen p-3 text-ink sm:p-5 lg:p-8">
      <div className="glass-panel mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/80 shadow-panel sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-4rem)]">
        <header className="border-b border-blue-100 bg-white/85">
          <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-sky-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                  <ShieldCheck size={14} aria-hidden="true" />
                  NCERT-only evaluation
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                  <BookOpenCheck size={14} aria-hidden="true" />
                  Class 10 Mathematics
                </div>
              </div>
              <h1 className="bg-gradient-to-r from-slate-950 via-blue-800 to-sky-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl lg:text-4xl">
                AI Tutor
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Upload the correct NCERT textbook, submit a valid maths question, and get a strict
                CBSE-style self evaluation.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
             
              <button
                type="button"
                onClick={resetSession}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-sky-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:from-blue-800 hover:to-sky-600"
              >
                <RotateCcw size={16} aria-hidden="true" />
                Start New Session
              </button>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/70 to-white px-3 py-4 sm:px-5 sm:py-6">
          <div className="mx-auto max-w-5xl space-y-5 rounded-2xl border border-blue-100 bg-white/95 p-3 shadow-panel sm:p-5">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <ChatMessage
                message={{
                  sender: "assistant",
                  text:
                    step === "pdf"
                      ? "Reading the PDF and building a temporary knowledge base..."
                      : step === "question"
                        ? "Extracting and saving the question..."
                        : "Retrieving NCERT context and evaluating strictly..."
                }}
              />
            )}

            {evaluation && (
              <div className="max-w-4xl lg:ml-12">
                <EvaluationResult result={evaluation} />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        {step !== "done" ? (
          <Composer step={step} isLoading={isLoading} onSubmit={handleSubmit} />
        ) : (
          <div className="border-t border-blue-100 bg-white p-4 text-center text-sm text-slate-600">
            Start a new session to evaluate another answer with a fresh uploaded textbook PDF.
          </div>
        )}
      </div>
    </main>
  );
}
