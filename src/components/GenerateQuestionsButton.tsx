"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateQuestionsButton({
  jdId,
  regenerate = false,
}: {
  jdId: string;
  regenerate?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/jd/${jdId}/questions`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't generate questions.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button onClick={onClick} className="btn-primary" disabled={loading}>
        {loading
          ? "Generating questions…"
          : regenerate
            ? "Regenerate questions"
            : "Generate interview questions"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
    </div>
  );
}
