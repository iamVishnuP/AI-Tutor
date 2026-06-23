import React from "react";
import { AlertCircle, CheckCircle2, GraduationCap, Lightbulb } from "lucide-react";

function ListBlock({ title, items, icon: Icon }) {
  return (
    <section className="rounded-lg border border-blue-100 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
        <Icon size={18} className="text-blue-700" aria-hidden="true" />
        <h3>{title}</h3>
      </div>
      {items?.length ? (
        <ul className="space-y-2 text-sm text-slate-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No items returned.</p>
      )}
    </section>
  );
}

export default function EvaluationResult({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-4 rounded-lg border border-blue-200 bg-white p-3 shadow-panel sm:p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Marks</p>
          <p className="mt-1 text-3xl font-bold text-blue-950">{result.marks}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Grade</p>
          <p className="mt-1 text-3xl font-bold text-blue-950">{result.grade}</p>
        </div>
      </div>

      <section className="rounded-lg border border-blue-100 bg-white p-4">
        <div className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
          <GraduationCap size={19} className="text-blue-700" aria-hidden="true" />
          <h3>Strict Feedback</h3>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{result.feedback}</p>
      </section>

      <ListBlock
        title="Missing Concepts or Steps"
        items={result.missing_points}
        icon={AlertCircle}
      />
      <ListBlock title="Suggestions" items={result.suggestions} icon={Lightbulb} />

      <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Evaluation was generated from the temporary session knowledge base built from the
          uploaded NCERT PDF.
        </span>
      </div>
    </div>
  );
}
