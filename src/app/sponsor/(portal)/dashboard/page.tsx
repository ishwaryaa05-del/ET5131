import Link from "next/link";
import { db } from "@/lib/db";
import { requireSponsor } from "@/lib/sponsorSession";
import { resolveAutoApprovals } from "@/lib/sponsorExchange/business";
import { TASK_TIER_LABELS } from "@/lib/sponsorExchange/constants";

export default async function SponsorDashboardPage() {
  const sponsor = await requireSponsor();
  await resolveAutoApprovals();

  const tasks = await db.task.findMany({
    where: { sponsorId: sponsor.id },
    orderBy: { createdAt: "desc" },
    include: { claims: true },
  });

  const pendingReview = tasks
    .flatMap((t) => t.claims.map((c) => ({ ...c, taskTitle: t.title, taskId: t.id })))
    .filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW");

  const totalClaimed = tasks.reduce((acc, t) => acc + t.seatsClaimed, 0);
  const activeStudents = new Set(
    tasks.flatMap((t) => t.claims.filter((c) => c.status === "APPROVED" || c.status === "AUTO_APPROVED").map((c) => c.studentId))
  ).size;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{sponsor.companyName}</h1>
      <p className="mt-1 text-sm text-muted">Your CareerBridge ASEAN sponsor overview.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Open tasks</p>
          <p className="mt-2 text-2xl font-semibold">{tasks.filter((t) => t.status === "OPEN").length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Seats claimed</p>
          <p className="mt-2 text-2xl font-semibold">{totalClaimed}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Active students</p>
          <p className="mt-2 text-2xl font-semibold">{activeStudents}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Needs review</h2>
        <Link href="/sponsor/tasks/new" className="btn-primary">
          + New task
        </Link>
      </div>

      {pendingReview.length === 0 ? (
        <p className="card mt-4 p-6 text-sm text-muted">Nothing waiting on you right now.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {pendingReview.map((c) => (
            <Link
              key={c.id}
              href={`/sponsor/tasks/${c.taskId}`}
              className="card flex flex-wrap items-center justify-between gap-2 p-4 transition-colors hover:border-brand"
            >
              <span className="text-sm font-medium">{c.taskTitle}</span>
              <span className="text-xs text-muted">
                Submitted {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"} · review by{" "}
                {c.reviewDeadline ? new Date(c.reviewDeadline).toLocaleDateString() : "—"}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Your tasks</h2>
        {tasks.length === 0 ? (
          <p className="card mt-4 p-6 text-sm text-muted">
            You haven&apos;t posted a task yet.{" "}
            <Link href="/sponsor/tasks/new" className="text-accent hover:underline">
              Post your first one
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tasks.map((t) => (
              <Link
                key={t.id}
                href={`/sponsor/tasks/${t.id}`}
                className="card flex flex-col gap-2 p-5 transition-colors hover:border-brand"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{t.title}</h3>
                  <span className="badge shrink-0">{t.status}</span>
                </div>
                <p className="text-xs text-muted">{TASK_TIER_LABELS[t.tier]}</p>
                <p className="text-sm text-muted">
                  {t.seatsClaimed} / {t.seatCap} seats claimed
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
