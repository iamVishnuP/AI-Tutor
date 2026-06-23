import React from "react";
import { Bot, User } from "lucide-react";

export default function ChatMessage({ message }) {
  const isAssistant = message.sender === "assistant";

  return (
    <div className={`flex gap-2 sm:gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && (
        <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 sm:flex">
          <Bot size={18} aria-hidden="true" />
        </div>
      )}

      <div
        className={`max-w-[90%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[82%] ${
          isAssistant
            ? "border-blue-100 bg-white text-slate-800"
            : "border-blue-700 bg-gradient-to-r from-blue-700 to-sky-500 text-white"
        }`}
      >
        {message.title && <p className="mb-1 font-semibold">{message.title}</p>}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>

      {!isAssistant && (
        <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white sm:flex">
          <User size={18} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
