"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGE_VALUES, LANGUAGE_LABELS, type LanguageValue } from "@/lib/constants";

export function StartPracticeButton({
  jdId,
  defaultLanguage,
}: {
  jdId: string;
  defaultLanguage: LanguageValue;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageValue>(defaultLanguage);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const res = await fetch(`/api/jd/${jdId}/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      router.push(`/jd/${jdId}/interview/session/${data.session.id}`);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="input w-auto"
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageValue)}
      >
        {LANGUAGE_VALUES.map((l) => (
          <option key={l} value={l}>
            Practice in: {LANGUAGE_LABELS[l]}
          </option>
        ))}
      </select>
      <button className="btn-primary" onClick={start} disabled={loading}>
        {loading ? "Starting…" : "Start Dual-Tongue practice session"}
      </button>
    </div>
  );
}
