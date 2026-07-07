"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TASK_TIER_VALUES,
  TASK_TIER_LABELS,
  TASK_TIER_DESCRIPTIONS,
  TASK_TIER_HOUR_CAPS,
  DEFAULT_TIER2_FORM_FIELDS,
  type TaskTierValue,
} from "@/lib/sponsorExchange/constants";

type FormField = { key: string; label: string; required: boolean };

export function SponsorTaskForm() {
  const router = useRouter();
  const [tier, setTier] = useState<TaskTierValue>("VISIBILITY");
  const [formFields, setFormFields] = useState<FormField[]>(DEFAULT_TIER2_FORM_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(index: number, patch: Partial<FormField>) {
    setFormFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function addField() {
    setFormFields((prev) => [...prev, { key: `field${prev.length + 1}`, label: "", required: true }]);
  }

  function removeField(index: number) {
    setFormFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const body = {
      tier,
      title: form.get("title"),
      description: form.get("description"),
      seatCap: Number(form.get("seatCap")),
      formFields: tier === "FEEDBACK" ? formFields.filter((f) => f.label.trim()) : undefined,
    };

    const res = await fetch("/api/sponsor/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    const data = await res.json();
    router.push(`/sponsor/tasks/${data.task.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label">Tier</label>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TASK_TIER_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTier(value)}
              className={`card p-4 text-left transition-colors ${
                tier === value ? "border-brand" : "hover:border-border"
              }`}
            >
              <p className="text-sm font-semibold">{TASK_TIER_LABELS[value]}</p>
              <p className="mt-1 text-xs text-muted">{TASK_TIER_DESCRIPTIONS[value]}</p>
              <p className="mt-2 text-xs font-medium text-accent">
                Hour cap: {TASK_TIER_HOUR_CAPS[value]}h
              </p>
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">
          The tier fixes the hour cap and the agreement students accept — these can&apos;t be customized.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="title">
          Title
        </label>
        <input className="input" id="title" name="title" required maxLength={160} />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea className="input min-h-32" id="description" name="description" required maxLength={4000} />
      </div>

      <div>
        <label className="label" htmlFor="seatCap">
          Seat cap
        </label>
        <input className="input" id="seatCap" name="seatCap" type="number" min={1} max={500} required defaultValue={10} />
      </div>

      {tier === "FEEDBACK" && (
        <div>
          <label className="label">Feedback form fields</label>
          <p className="mt-1 text-xs text-muted">
            Students will fill these in — the submission itself is the proof, so keep them specific.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {formFields.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input"
                  value={f.label}
                  onChange={(e) => updateField(i, { label: e.target.value })}
                  placeholder="Field label"
                />
                <label className="flex shrink-0 items-center gap-1 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => updateField(i, { required: e.target.checked })}
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="shrink-0 text-xs text-muted hover:text-brand"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addField} className="btn-secondary mt-2">
            + Add field
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Posting…" : "Post task"}
      </button>
    </form>
  );
}
