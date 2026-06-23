import React from "react";
import { FileText, Image, Loader2, Send, Upload } from "lucide-react";
import { useMemo, useState } from "react";

const stepCopy = {
  pdf: {
    label: "Upload NCERT Mathematics PDF",
    accept: "application/pdf",
    icon: FileText,
    inputName: "pdf"
  },
  question: {
    label: "Type the question or upload an image",
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    icon: Image,
    inputName: "question-image"
  },
  answer: {
    label: "Type your answer or upload handwritten work",
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    icon: Image,
    inputName: "answer-image"
  }
};

export default function Composer({ step, isLoading, onSubmit }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const config = stepCopy[step];
  const Icon = config.icon;

  const canType = step !== "pdf";
  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (step === "pdf") return Boolean(file);
    return Boolean(text.trim() || file);
  }, [file, isLoading, step, text]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({ text: text.trim(), file });
    setText("");
    setFile(null);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-blue-100 bg-white p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {canType && (
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder={step === "question" ? "Type the mathematics question..." : "Type your answer step by step..."}
            className="min-h-24 w-full resize-none rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            disabled={isLoading}
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-h-12 min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/70 px-4 py-3 text-sm text-slate-800 transition hover:border-blue-500 hover:bg-white sm:flex-1">
            <Icon size={18} className="text-blue-700" aria-hidden="true" />
            <span className="truncate font-medium">{file ? file.name : config.label}</span>
            <input
              name={config.inputName}
              type="file"
              accept={config.accept}
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              disabled={isLoading}
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-sky-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-800 hover:to-sky-600 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-600 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                Processing
              </>
            ) : step === "pdf" ? (
              <>
                <Upload size={17} aria-hidden="true" />
                Upload
              </>
            ) : (
              <>
                <Send size={17} aria-hidden="true" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
