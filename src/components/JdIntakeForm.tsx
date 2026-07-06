"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JdIntakeForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setWarning(null);

    if (mode === "paste" && text.trim().length < 40) {
      setError("Paste a fuller job description (at least a few sentences).");
      return;
    }
    if (mode === "upload" && !file) {
      setError("Choose a PDF file to upload.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    if (mode === "upload" && file) {
      form.append("file", file);
    } else {
      form.append("text", text);
    }

    const res = await fetch("/api/jd", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push(`/jd/${data.jd.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
          className="input min-h-[260px] font-mono text-xs leading-5"
          placeholder="Paste the full job description here…"
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

      {error && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {warning && (
        <p className="rounded-sm bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {warning}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Reading job description…" : "Continue"}
      </button>
    </form>
  );
}
