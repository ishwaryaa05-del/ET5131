import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { SkillGapPanel } from "@/components/SkillGapPanel";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ jdId?: string }>;
}) {
  const user = await requireProfile();
  const { jdId } = await searchParams;

  const [jds, resumes, latestReport] = await Promise.all([
    db.jobDescription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    }),
    db.skillGapReport.findFirst({
      where: { userId: user.id, ...(jdId ? { jdId } : {}) },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const orderedJds = jdId ? [...jds].sort((a, b) => (a.id === jdId ? -1 : b.id === jdId ? 1 : 0)) : jds;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Skill-Gap Detection</h1>
      <p className="mt-1 text-sm text-muted">
        See exactly which skills your resume is missing for a role, routed to real courses — not
        a generic catalog search.
      </p>

      <div className="mt-6">
        <SkillGapPanel
          jds={orderedJds}
          resumes={resumes.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString() }))}
          initialReport={
            latestReport
              ? {
                  id: latestReport.id,
                  createdAt: latestReport.createdAt.toISOString(),
                  jdId: latestReport.jdId,
                  resumeId: latestReport.resumeId,
                  gaps: latestReport.gaps as unknown as {
                    skill: string;
                    why: string;
                    courses: { platform: string; title: string; url: string }[];
                  }[],
                }
              : null
          }
        />
      </div>
    </div>
  );
}
