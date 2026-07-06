"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResumeTailorControls({
  resumeId,
  jds,
  currentJdId,
}: {
  resumeId: string;
  jds: { id: string; title: string }[];
  currentJdId?: string;
}) {
  const router = useRouter();
  const [jdId, setJdId] = useState(currentJdId ?? jds[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onTailor() {
    if (!jdId) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/resume/${resumeId}/tailor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jdId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't tailor resume.");
      return;
    }
    router.refresh();
  }

  if (jds.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select className="input w-auto" value={jdId} onChange={(e) => setJdId(e.target.value)}>
        {jds.map((jd) => (
          <option key={jd.id} value={jd.id}>
            {jd.title}
          </option>
        ))}
      </select>
      <button className="btn-secondary" onClick={onTailor} disabled={loading}>
        {loading ? "Tailoring…" : "Tailor against this JD"}
      </button>
      {error && <span className="text-sm text-red-700 dark:text-red-300">{error}</span>}
    </div>
  );
}
