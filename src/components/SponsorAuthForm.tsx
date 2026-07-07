"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SponsorAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body =
      mode === "signup"
        ? {
            companyName: form.get("companyName"),
            industry: form.get("industry"),
            contactName: form.get("contactName"),
            contactEmail: form.get("contactEmail"),
            password: form.get("password"),
          }
        : { contactEmail: form.get("contactEmail"), password: form.get("password") };

    const res = await fetch(`/api/sponsor/auth/${mode}`, {
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

    router.push("/sponsor/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {mode === "signup" && (
        <>
          <div>
            <label className="label" htmlFor="companyName">
              Company name
            </label>
            <input className="input" id="companyName" name="companyName" required maxLength={160} />
          </div>
          <div>
            <label className="label" htmlFor="industry">
              Industry
            </label>
            <input className="input" id="industry" name="industry" required maxLength={120} />
          </div>
          <div>
            <label className="label" htmlFor="contactName">
              Contact name
            </label>
            <input className="input" id="contactName" name="contactName" required maxLength={120} />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="contactEmail">
          Work email
        </label>
        <input className="input" id="contactEmail" name="contactEmail" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 8 : undefined}
        />
        {mode === "signup" && <p className="mt-1 text-xs text-muted">At least 8 characters.</p>}
      </div>
      {error && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary mt-2" disabled={loading}>
        {loading ? "Please wait…" : mode === "signup" ? "Create sponsor account" : "Log in"}
      </button>
    </form>
  );
}
