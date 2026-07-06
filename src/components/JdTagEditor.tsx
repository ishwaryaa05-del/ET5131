"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LEVEL_VALUES, ROLE_LEVEL_LABELS, type RoleLevelValue } from "@/lib/constants";

export function JdTagEditor({
  jdId,
  title,
  industry,
  roleLevel,
}: {
  jdId: string;
  title: string;
  industry: string;
  roleLevel: RoleLevelValue;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch(`/api/jd/${jdId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        industry: form.get("industry"),
        roleLevel: form.get("roleLevel"),
      }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <span className="badge">{industry}</span>
        <span className="badge">{ROLE_LEVEL_LABELS[roleLevel]}</span>
        <button
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-brand hover:underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-wrap items-end gap-3 p-4">
      <div>
        <label className="label">Title</label>
        <input className="input" name="title" defaultValue={title} required maxLength={200} />
      </div>
      <div>
        <label className="label">Industry</label>
        <input className="input" name="industry" defaultValue={industry} required maxLength={120} />
      </div>
      <div>
        <label className="label">Role level</label>
        <select className="input" name="roleLevel" defaultValue={roleLevel}>
          {ROLE_LEVEL_VALUES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LEVEL_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving…" : "Save"}
      </button>
      <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
        Cancel
      </button>
    </form>
  );
}
