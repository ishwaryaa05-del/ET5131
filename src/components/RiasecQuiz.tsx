"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RIASEC_ITEMS } from "@/lib/riasec";

const SCALE = [
  { value: 1, label: "Strongly dislike" },
  { value: 2, label: "Dislike" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Like" },
  { value: 5, label: "Strongly like" },
];

export function RiasecQuiz() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === RIASEC_ITEMS.length;

  async function onSubmit() {
    if (!complete) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/riasec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: RIASEC_ITEMS.map((item) => ({ itemId: item.id, score: answers[item.id] })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card sticky top-2 z-10 flex items-center justify-between p-4">
        <p className="text-sm font-medium">
          {answeredCount} / {RIASEC_ITEMS.length} answered
        </p>
        <div className="h-2 w-40 rounded-full bg-brand-soft">
          <div
            className="h-2 rounded-full bg-brand transition-all"
            style={{ width: `${(answeredCount / RIASEC_ITEMS.length) * 100}%` }}
          />
        </div>
      </div>

      {RIASEC_ITEMS.map((item, i) => (
        <div key={item.id} className="card p-5">
          <p className="text-sm font-medium">
            {i + 1}. I like activities that involve: {item.text}
          </p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {SCALE.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-2 py-2 text-center text-xs transition-colors ${
                  answers[item.id] === opt.value
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-border hover:bg-brand-soft/50"
                }`}
              >
                <input
                  type="radio"
                  name={item.id}
                  value={opt.value}
                  className="sr-only"
                  checked={answers[item.id] === opt.value}
                  onChange={() => setAnswers((prev) => ({ ...prev, [item.id]: opt.value }))}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}

      <button className="btn-primary self-start" onClick={onSubmit} disabled={!complete || loading}>
        {loading ? "Scoring…" : complete ? "See my results" : `Answer all items to continue`}
      </button>
    </div>
  );
}
