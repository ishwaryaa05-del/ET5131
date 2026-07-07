import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { TASK_TIER_VALUES, TASK_TIER_LABELS } from "@/lib/sponsorExchange/constants";

export default async function BrowseTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; industry?: string; sponsorId?: string }>;
}) {
  await requireUser();
  const { tier, industry, sponsorId } = await searchParams;

  const sponsors = await db.sponsor.findMany({ orderBy: { companyName: "asc" } });
  const industries = Array.from(new Set(sponsors.map((s) => s.industry))).sort();

  const tasks = await db.task.findMany({
    where: {
      status: "OPEN",
      ...(tier ? { tier: tier as (typeof TASK_TIER_VALUES)[number] } : {}),
      ...(sponsorId ? { sponsorId } : {}),
      ...(industry ? { sponsor: { industry } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { sponsor: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Sponsor tasks</h1>
      <p className="mt-1 text-sm text-muted">
        Complete a small, scoped task for a sponsor to earn free platform access.
      </p>

      <form className="card mt-6 flex flex-wrap gap-3 p-4" method="get">
        <div>
          <label className="label" htmlFor="tier">
            Tier
          </label>
          <select className="input" id="tier" name="tier" defaultValue={tier ?? ""}>
            <option value="">All tiers</option>
            {TASK_TIER_VALUES.map((value) => (
              <option key={value} value={value}>
                {TASK_TIER_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="industry">
            Industry
          </label>
          <select className="input" id="industry" name="industry" defaultValue={industry ?? ""}>
            <option value="">All industries</option>
            {industries.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sponsorId">
            Sponsor
          </label>
          <select className="input" id="sponsorId" name="sponsorId" defaultValue={sponsorId ?? ""}>
            <option value="">All sponsors</option>
            {sponsors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-secondary">
            Filter
          </button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-muted">No open tasks match those filters right now.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="card flex flex-col gap-2 p-5 transition-colors hover:border-brand"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{t.title}</h3>
                <span className="badge shrink-0">{TASK_TIER_LABELS[t.tier]}</span>
              </div>
              <p className="text-xs text-muted">
                {t.sponsor.companyName} · {t.sponsor.industry}
              </p>
              <p className="text-sm text-muted line-clamp-2">{t.description}</p>
              <p className="mt-1 text-xs text-muted">
                {t.seatCap - t.seatsClaimed} of {t.seatCap} seats left · {t.hourCap}h cap
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
