import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { ResumeIntakeForm } from "@/components/ResumeIntakeForm";
import { ResumeTailorControls } from "@/components/ResumeTailorControls";
import type { ResumeTailoringResult } from "@/lib/ai";

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ jdId?: string }>;
}) {
  const user = await requireProfile();
  const { jdId } = await searchParams;

  const [jds, resumes] = await Promise.all([
    db.jobDescription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const latest = resumes[0];
  const tailoring = latest?.tailoring as (ResumeTailoringResult & { jdId: string }) | null | undefined;
  const tailoredJd = tailoring ? jds.find((j) => j.id === tailoring.jdId) : undefined;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
      <p className="mt-1 text-sm text-muted">
        Upload or paste your resume. We&apos;ll check formatting against local norms and content
        against your target JD.
      </p>

      <div className="card mt-6 p-6">
        <ResumeIntakeForm jds={jds} defaultJdId={jdId} />
      </div>

      {latest && (
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Latest resume{" "}
              <span className="text-sm font-normal text-muted">
                (saved {latest.createdAt.toLocaleString()})
              </span>
            </h2>
            <ResumeTailorControls resumeId={latest.id} jds={jds} currentJdId={tailoring?.jdId} />
          </div>

          {!tailoring ? (
            <p className="card p-6 text-sm text-muted">
              Not tailored to a JD yet. Pick one above and click &quot;Tailor against this JD&quot;.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {tailoredJd && (
                <p className="text-sm text-muted">
                  Tailored against: <span className="font-medium text-foreground">{tailoredJd.title}</span>
                </p>
              )}

              <div className="card p-6">
                <h3 className="font-semibold">Format suggestions</h3>
                <p className="mt-1 text-xs text-muted">Calibrated to local market norms.</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {tailoring.formatSuggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-brand">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold">Content suggestions</h3>
                <div className="mt-3 flex flex-col gap-4">
                  {tailoring.contentSuggestions.map((c, i) => (
                    <div key={i} className="rounded-lg border border-border p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Original
                      </p>
                      <p className="mt-1 text-sm text-muted line-through decoration-red-400">
                        {c.original}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-dark">
                        Suggested
                      </p>
                      <p className="mt-1 text-sm">{c.suggestion}</p>
                      <p className="mt-2 text-xs text-muted">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
