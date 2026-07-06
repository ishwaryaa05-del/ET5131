import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ROLE_LEVEL_LABELS } from "@/lib/constants";

export default async function JdListPage() {
  const user = await requireUser();
  const jds = await db.jobDescription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job Descriptions</h1>
          <p className="mt-1 text-sm text-muted">
            Paste or upload a JD to unlock interview questions, resume tailoring, and skill-gap
            detection for that role.
          </p>
        </div>
        <Link href="/jd/new" className="btn-primary whitespace-nowrap">
          + New JD
        </Link>
      </div>

      {jds.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-muted">You haven&apos;t added a job description yet.</p>
          <Link href="/jd/new" className="btn-primary">
            Add your first JD
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {jds.map((jd) => (
            <Link
              key={jd.id}
              href={`/jd/${jd.id}`}
              className="card flex flex-col gap-2 p-5 transition-colors hover:border-brand"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{jd.title}</h3>
                <span className="badge shrink-0">{ROLE_LEVEL_LABELS[jd.roleLevel]}</span>
              </div>
              <p className="text-sm text-muted">{jd.industry}</p>
              <p className="text-xs text-muted">
                Added {jd.createdAt.toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
