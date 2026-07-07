"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskTierValue } from "@/lib/sponsorExchange/constants";

type FormField = { key: string; label: string; required: boolean };

export function TaskSubmissionForm({
  claimId,
  tier,
  formFields,
}: {
  claimId: string;
  tier: TaskTierValue;
  formFields: FormField[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"url" | "file">("url");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotes([]);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    let res: Response;
    if (tier === "APPLIED_PROJECT" || (tier === "VISIBILITY" && mode === "file")) {
      const fd = new FormData();
      const file = form.get("file");
      if (file instanceof File && file.size > 0) fd.append("file", file);
      res = await fetch(`/api/task-claims/${claimId}/submit`, { method: "POST", body: fd });
    } else if (tier === "FEEDBACK") {
      const fields: Record<string, string> = {};
      for (const f of formFields) fields[f.key] = String(form.get(f.key) ?? "");
      res = await fetch(`/api/task-claims/${claimId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
    } else {
      res = await fetch(`/api/task-claims/${claimId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.get("url") }),
      });
    }

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    const data = await res.json();
    if (!data.ok && data.notes?.length) {
      setNotes(data.notes);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Submit your work</h2>

      {tier === "VISIBILITY" && (
        <>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === "url"} onChange={() => setMode("url")} />
              Link to it
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={mode === "file"} onChange={() => setMode("file")} />
              Upload a screenshot instead
            </label>
          </div>
          {mode === "url" ? (
            <div>
              <label className="label" htmlFor="url">
                URL
              </label>
              <input className="input" id="url" name="url" type="url" placeholder="https://…" required />
            </div>
          ) : (
            <div>
              <p className="mb-1 text-xs text-muted">
                Only use this if your work truly can&apos;t be linked publicly.
              </p>
              <input className="input" name="file" type="file" required />
            </div>
          )}
        </>
      )}

      {tier === "FEEDBACK" &&
        formFields.map((f) => (
          <div key={f.key}>
            <label className="label" htmlFor={f.key}>
              {f.label}
              {f.required && " *"}
            </label>
            <textarea className="input min-h-20" id={f.key} name={f.key} required={f.required} />
          </div>
        ))}

      {tier === "APPLIED_PROJECT" && (
        <div>
          <label className="label" htmlFor="file">
            Deliverable file
          </label>
          <input className="input" id="file" name="file" type="file" required />
        </div>
      )}

      {notes.length > 0 && (
        <div className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          <p className="font-medium">Please fix the following before resubmitting:</p>
          <ul className="mt-1 list-inside list-disc">
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
