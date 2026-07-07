import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { resolveAutoApprovals, computeDeadlineSoonCutoff } from "@/lib/sponsorExchange/business";
import { ADMIN_DEADLINE_SOON_DAYS, TASK_TIER_LABELS } from "@/lib/sponsorExchange/constants";

export default async function AdminPage() {
  await requireAdmin();
  await resolveAutoApprovals();

  const deadlineSoonCutoff = computeDeadlineSoonCutoff();

  const [dueSoon, flagged, sponsors] = await Promise.all([
    db.taskClaim.findMany({
      where: {
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
        reviewDeadline: { lte: deadlineSoonCutoff },
      },
      include: { task: { include: { sponsor: true } }, student: true },
      orderBy: { reviewDeadline: "asc" },
    }),
    db.taskClaim.findMany({
      where: { status: "CLAIMED" },
      include: { task: { include: { sponsor: true } }, student: true },
      orderBy: { claimedAt: "desc" },
    }),
    db.sponsor.findMany({
      include: {
        tasks: { include: { claims: true } },
      },
      orderBy: { companyName: "asc" },
    }),
  ]);

  const flaggedWithNotes = flagged.filter(
    (c) => Array.isArray(c.precheckNotes) && c.precheckNotes.length > 0
  );

  const sponsorStats = sponsors.map((s) => ({
    id: s.id,
    companyName: s.companyName,
    activeStudents: new Set(
      s.tasks.flatMap((t) =>
        t.claims.filter((c) => c.status === "APPROVED" || c.status === "AUTO_APPROVED").map((c) => c.studentId)
      )
    ).size,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Sponsor Exchange admin</h1>
      <p className="mt-1 text-sm text-muted">Internal view for platform operations.</p>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">About to auto-approve</h2>
        <p className="text-xs text-muted">
          Claims still awaiting sponsor review within {ADMIN_DEADLINE_SOON_DAYS} days of their deadline.
        </p>
        {dueSoon.length === 0 ? (
          <p className="card mt-3 p-6 text-sm text-muted">Nothing coming up.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {dueSoon.map((c) => (
              <Link
                key={c.id}
                href={`/sponsor/tasks/${c.taskId}`}
                className="card flex flex-wrap items-center justify-between gap-2 p-4 transition-colors hover:border-brand"
              >
                <span className="text-sm font-medium">
                  {c.task.sponsor.companyName} · {c.task.title}
                </span>
                <span className="text-xs text-muted">
                  {c.student.name} · due {c.reviewDeadline ? new Date(c.reviewDeadline).toLocaleDateString() : "—"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Flagged by automated pre-check</h2>
        <p className="text-xs text-muted">Students whose last submission attempt failed validation.</p>
        {flaggedWithNotes.length === 0 ? (
          <p className="card mt-3 p-6 text-sm text-muted">No flagged submissions.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {flaggedWithNotes.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {c.task.sponsor.companyName} · {c.task.title} ({TASK_TIER_LABELS[c.task.tier]})
                  </span>
                  <span className="text-xs text-muted">{c.student.name}</span>
                </div>
                <ul className="mt-2 list-inside list-disc text-xs text-muted">
                  {(c.precheckNotes as string[]).map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Active students per sponsor</h2>
        <p className="text-xs text-muted">For CSR impact reporting.</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sponsorStats.map((s) => (
            <div key={s.id} className="card p-5">
              <p className="font-semibold">{s.companyName}</p>
              <p className="mt-2 text-2xl font-semibold">{s.activeStudents}</p>
              <p className="text-xs text-muted">active students</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
