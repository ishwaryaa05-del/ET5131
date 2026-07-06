"use client";

import { useState } from "react";

export function QuestionCard({
  index,
  question,
  strongAnswerNote,
}: {
  index: number;
  question: string;
  strongAnswerNote: string;
}) {
  const [attempt, setAttempt] = useState("");
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-muted">Question {index + 1}</p>
      <p className="mt-1 text-base font-semibold">{question}</p>

      <textarea
        className="input mt-3 min-h-[90px]"
        placeholder="Jot down how you'd answer this before peeking at the strong-answer note…"
        value={attempt}
        onChange={(e) => setAttempt(e.target.value)}
      />

      {!revealed ? (
        <button
          className="btn-secondary mt-3"
          disabled={attempt.trim().length === 0}
          onClick={() => setRevealed(true)}
          title={attempt.trim().length === 0 ? "Write your own attempt first" : undefined}
        >
          Reveal what a strong answer looks like
        </button>
      ) : (
        <div className="mt-3 rounded-lg bg-brand-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
            Strong answer in this market
          </p>
          <p className="mt-1 text-sm leading-6 text-brand-dark">{strongAnswerNote}</p>
        </div>
      )}
    </div>
  );
}
