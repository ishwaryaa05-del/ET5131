"use client";

import { useState } from "react";
import Link from "next/link";

type Course = { platform: string; title: string; url: string };
type Gap = { skill: string; why: string; courses: Course[] };
type Report = { id: string; createdAt: string; gaps: Gap[]; jdId: string; resumeId: string };

export function SkillGapPanel({
  jds,
  resumes,
  initialReport,
}: {
  jds: { id: string; title: string }[];
  resumes: { id: string; createdAt: string }[];
  initialReport: Report | null;
}) {
  const [jdId, setJdId] = useState(initialReport?.jdId ?? jds[0]?.id ?? "");
  const [resumeId, setResumeId] = useState(initialReport?.resumeId ?? resumes[0]?.id ?? "");
  const [report, setReport] = useState<Report | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDetect() {
    if (!jdId || !resumeId) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/skills/gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jdId, resumeId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't detect skill gaps.");
      return;
    }
    setReport(data.report);
  }

  if (jds.length === 0 || resumes.length === 0) {
    return (
      <div className="card p-8 text-sm text-muted">
        You need at least one job description and one saved resume before running a skill-gap
        check. Add a{" "}
        <Link href="/jd/new" className="text-brand hover:underline">
          job description
        </Link>{" "}
        and a{" "}
        <Link href="/resume" className="text-brand hover:underline">
          resume
        </Link>{" "}
        first.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-wrap items-end gap-3 p-5">
        <div>
          <label className="label">Job description</label>
          <select className="input w-auto" value={jdId} onChange={(e) => setJdId(e.target.value)}>
            {jds.map((jd) => (
              <option key={jd.id} value={jd.id}>
                {jd.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Resume</label>
          <select className="input w-auto" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            {resumes.map((r, i) => (
              <option key={r.id} value={r.id}>
                Resume from {new Date(r.createdAt).toLocaleDateString()} {i === 0 ? "(latest)" : ""}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={onDetect} disabled={loading}>
          {loading ? "Comparing…" : "Detect skill gaps"}
        </button>
      </div>

      {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}

      {report && (
        <div className="flex flex-col gap-4">
          {report.gaps.length === 0 ? (
            <p className="card p-6 text-sm text-muted">
              No significant gaps detected — your resume already covers what this JD asks for.
            </p>
          ) : (
            report.gaps.map((gap, i) => (
              <div key={i} className="card p-5">
                <h3 className="font-semibold">{gap.skill}</h3>
                <p className="mt-1 text-sm text-muted">{gap.why}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gap.courses.map((c) => (
                    <a
                      key={c.platform}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge hover:bg-brand hover:text-white"
                    >
                      {c.platform} ↗
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
