import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { JdTagEditor } from "@/components/JdTagEditor";

export default async function JdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const jd = await db.jobDescription.findUnique({ where: { id } });
  if (!jd || jd.userId !== user.id) notFound();

  return (
    <div>
      <Link href="/jd" className="text-sm text-muted hover:text-brand">
        ← All job descriptions
      </Link>

      <div className="mt-3">
        <JdTagEditor jdId={jd.id} title={jd.title} industry={jd.industry} roleLevel={jd.roleLevel} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={`/jd/${jd.id}/interview`} className="card p-5 transition-colors hover:border-brand">
          <h3 className="font-semibold">Interview questions</h3>
          <p className="mt-1 text-sm text-muted">
            Generate market-calibrated questions and practice with Dual-Tongue coaching.
          </p>
        </Link>
        <Link href={`/resume?jdId=${jd.id}`} className="card p-5 transition-colors hover:border-brand">
          <h3 className="font-semibold">Tailor resume</h3>
          <p className="mt-1 text-sm text-muted">
            Check your resume against this JD and local market norms.
          </p>
        </Link>
        <Link href={`/skills?jdId=${jd.id}`} className="card p-5 transition-colors hover:border-brand">
          <h3 className="font-semibold">Skill gaps</h3>
          <p className="mt-1 text-sm text-muted">
            Find exactly what&apos;s missing and get matched to courses.
          </p>
        </Link>
      </div>

      <details className="card mt-6 p-5">
        <summary className="cursor-pointer text-sm font-medium">View original job description text</summary>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{jd.rawText}</p>
      </details>
    </div>
  );
}
