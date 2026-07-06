"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResumeIntakeForm({
  jds,
  defaultJdId,
}: {
  jds: { id: string; title: string }[];
  defaultJdId?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jdId, setJdId] = useState(defaultJdId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setWarning(null);

    if (mode === "paste" && text.trim().length < 40) {
      setError("Paste a fuller resume (at least a few lines).");
      return;
    }
    if (mode === "upload" && !file) {
      setError("Choose a PDF file to upload.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    if (mode === "upload" && file) form.append("file", file);
    else form.append("text", text);
    if (jdId) form.append("jdId", jdId);

    const res = await fetch("/api/resume", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (data.warning) setWarning(data.warning);

    router.refresh();
    setText("");
    setFile(null);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={mode === "paste" ? "btn-primary" : "btn-secondary"}
        >
          Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={mode === "upload" ? "btn-primary" : "btn-secondary"}
        >
          Upload PDF
        </button>
      </div>

      {mode === "paste" ? (
        <textarea
          className="input min-h-[220px] font-mono text-xs leading-5"
          placeholder="Paste your resume text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <input
          type="file"
          accept="application/pdf"
          className="input"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      )}

      <div>
        <label className="label">Tailor against which JD? (optional, recommended)</label>
        <select className="input" value={jdId} onChange={(e) => setJdId(e.target.value)}>
          <option value="">Just save for now</option>
          {jds.map((jd) => (
            <option key={jd.id} value={jd.id}>
              {jd.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {warning && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {warning}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Analyzing resume…" : "Save & tailor"}
      </button>
    </form>
  );
}
