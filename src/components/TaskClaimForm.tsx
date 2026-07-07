"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TaskClaimForm({ taskId, agreementText }: { taskId: string; agreementText: string }) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/tasks/${taskId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agreementAccepted: true }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Agreement</h2>
      <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-foreground">
        {agreementText}
      </pre>
      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        I have read and accept this agreement.
      </label>
      {error && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button type="button" className="btn-primary mt-4" disabled={!accepted || loading} onClick={claim}>
        {loading ? "Claiming…" : "Claim this task"}
      </button>
    </div>
  );
}
