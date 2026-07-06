import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { InterviewProgressChart, type ProgressPoint } from "@/components/InterviewProgressChart";
import { MARKET_LABELS, LANGUAGE_LABELS } from "@/lib/constants";

export default async function DashboardPage() {
  const user = await requireProfile();

  const [jdCount, latestResume, sessions, latestSkillGap, latestRiasec] = await Promise.all([
    db.jobDescription.count({ where: { userId: user.id } }),
    db.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      include: { turns: true, jd: { select: { id: true, title: true } } },
    }),
    db.skillGapReport.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { jd: { select: { title: true } } },
    }),
    db.riasecResult.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const lastSessionWithTurns = sessions.find((s) => s.turns.length > 0);
  const lastScores = lastSessionWithTurns
    ? (() => {
        const turns = lastSessionWithTurns.turns as { feedback: unknown }[];
        const avg = (key: string) =>
          turns.reduce((acc, t) => acc + (t.feedback as Record<string, number>)[key], 0) / turns.length;
        return {
          content: avg("contentScore"),
          delivery: avg("deliveryScore"),
          culturalFit: avg("culturalFitScore"),
        };
      })()
    : null;

  const progressData: ProgressPoint[] = [...sessions]
    .filter((s) => s.turns.length > 0)
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
    .map((s, i) => {
      const englishTurns = s.turns.filter((t) => t.answerLanguage === "ENGLISH").length;
      const avgCulturalFit =
        s.turns.reduce((acc, t) => acc + (t.feedback as { culturalFitScore: number }).culturalFitScore, 0) /
        s.turns.length;
      return {
        session: `Session ${i + 1}`,
        date: s.startedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        englishPct: Math.round((englishTurns / s.turns.length) * 100),
        avgCulturalFit: Math.round(avgCulturalFit * 10),
      };
    });

  const gaps = latestSkillGap?.gaps as unknown as { skill: string }[] | undefined;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Your CareerBridge preparation, at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Profile"
          href="/onboarding"
          body={
            <>
              <p>{MARKET_LABELS[user.profile.market]} · {user.profile.industry}</p>
              <p className="mt-1 text-muted">
                Practicing in {LANGUAGE_LABELS[user.profile.practiceLanguage]}
              </p>
            </>
          }
          cta="Update profile"
        />

        <DashboardCard
          title="Job descriptions"
          href="/jd"
          body={<p>{jdCount} saved</p>}
          cta={jdCount === 0 ? "Add your first JD" : "View all"}
        />

        <DashboardCard
          title="Resume status"
          href="/resume"
          body={
            latestResume ? (
              <>
                <p>Saved {latestResume.createdAt.toLocaleDateString()}</p>
                <p className="mt-1 text-muted">
                  {latestResume.tailoring ? "Tailored to a JD" : "Not tailored yet"}
                </p>
              </>
            ) : (
              <p className="text-muted">No resume uploaded yet</p>
            )
          }
          cta={latestResume ? "View tailoring" : "Upload resume"}
        />

        <DashboardCard
          title="Last interview score"
          href={
            lastSessionWithTurns
              ? `/jd/${lastSessionWithTurns.jd.id}/interview/session/${lastSessionWithTurns.id}`
              : "/jd"
          }
          body={
            lastScores ? (
              <p>
                Content {lastScores.content.toFixed(1)} · Delivery {lastScores.delivery.toFixed(1)} ·
                Cultural fit {lastScores.culturalFit.toFixed(1)} <span className="text-muted">/ 10</span>
              </p>
            ) : (
              <p className="text-muted">No practice sessions yet</p>
            )
          }
          cta={lastSessionWithTurns ? "Review session" : "Start practicing"}
        />

        <DashboardCard
          title="Skill-gap summary"
          href="/skills"
          body={
            gaps ? (
              <p>
                {gaps.length} gap{gaps.length === 1 ? "" : "s"} found for{" "}
                {latestSkillGap?.jd.title}
              </p>
            ) : (
              <p className="text-muted">No skill-gap check yet</p>
            )
          }
          cta={gaps ? "View courses" : "Run a check"}
        />

        <DashboardCard
          title="RIASEC fit"
          href="/riasec"
          body={
            latestRiasec ? (
              <p>Your code: <span className="font-semibold">{latestRiasec.code}</span></p>
            ) : (
              <p className="text-muted">Not taken yet</p>
            )
          }
          cta={latestRiasec ? "View result" : "Take assessment"}
        />
      </div>

      {progressData.length >= 2 && (
        <div className="mt-8">
          <InterviewProgressChart data={progressData} />
        </div>
      )}
    </div>
  );
}

function DashboardCard({
  title,
  href,
  body,
  cta,
}: {
  title: string;
  href: string;
  body: React.ReactNode;
  cta: string;
}) {
  return (
    <Link href={href} className="card flex flex-col gap-2 p-5 hover:shadow-md">
      <h3 className="font-semibold">{title}</h3>
      <div className="text-sm">{body}</div>
      <span className="mt-auto pt-2 text-sm font-medium text-brand">{cta} →</span>
    </Link>
  );
}
