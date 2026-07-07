import Link from "next/link";
import { db } from "@/lib/db";
import { requireSponsor } from "@/lib/sponsorSession";
import { TASK_TIER_LABELS } from "@/lib/sponsorExchange/constants";

export default async function SponsorTasksPage() {
  const sponsor = await requireSponsor();

  const tasks = await db.task.findMany({
    where: { sponsorId: sponsor.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your tasks</h1>
        <Link href="/sponsor/tasks/new" className="btn-primary">
          + New task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-muted">
          You haven&apos;t posted a task yet.{" "}
          <Link href="/sponsor/tasks/new" className="text-accent hover:underline">
            Post your first one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
  );
}
