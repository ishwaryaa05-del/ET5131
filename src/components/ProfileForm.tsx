"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MARKET_VALUES,
  MARKET_LABELS,
  LANGUAGE_VALUES,
  LANGUAGE_LABELS,
  INDUSTRY_SUGGESTIONS,
  type MarketValue,
  type LanguageValue,
} from "@/lib/constants";

export function ProfileForm({
  initial,
  redirectTo = "/dashboard",
  submitLabel = "Save and continue",
}: {
  initial?: { market: MarketValue; industry: string; practiceLanguage: LanguageValue };
  redirectTo?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      market: form.get("market"),
      industry: form.get("industry"),
      practiceLanguage: form.get("practiceLanguage"),
    };

    const res = await fetch("/api/profile", {
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

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <label className="label" htmlFor="market">
          Target market
        </label>
        <select
          className="input"
          id="market"
          name="market"
          required
          defaultValue={initial?.market ?? ""}
        >
          <option value="" disabled>
            Select a market
          </option>
          {MARKET_VALUES.map((m) => (
            <option key={m} value={m}>
              {MARKET_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="industry">
          Target industry
        </label>
        <input
          className="input"
          id="industry"
          name="industry"
          list="industry-suggestions"
          placeholder="e.g. Banking & Finance"
          required
          maxLength={120}
          defaultValue={initial?.industry ?? ""}
        />
        <datalist id="industry-suggestions">
          {INDUSTRY_SUGGESTIONS.map((i) => (
            <option key={i} value={i} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="label" htmlFor="practiceLanguage">
          Preferred practice language
        </label>
        <select
          className="input"
          id="practiceLanguage"
          name="practiceLanguage"
          required
          defaultValue={initial?.practiceLanguage ?? ""}
        >
          <option value="" disabled>
            Select a language
          </option>
          {LANGUAGE_VALUES.map((l) => (
            <option key={l} value={l}>
              {LANGUAGE_LABELS[l]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          You can switch languages any time during interview practice.
        </p>
      </div>

      {error && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-1" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
