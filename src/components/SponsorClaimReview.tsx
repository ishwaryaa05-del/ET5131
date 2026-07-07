"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SponsorClaimReview({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "approve" | "reject") {
    setLoading(decision);
    setError(null);
    const res = await fetch(`/api/sponsor/task-claims/${claimId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note: note.trim() || undefined }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <textarea
        className="input min-h-16"
        placeholder="Optional note to the student…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={2000}
      />
      {error && <p className="text-xs text-red-700 dark:text-red-300">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={loading !== null}
          onClick={() => decide("approve")}
        >
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={loading !== null}
          onClick={() => decide("reject")}
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </div>
  );
}
