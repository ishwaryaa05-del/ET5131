import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { GenerateQuestionsButton } from "@/components/GenerateQuestionsButton";
import { QuestionCard } from "@/components/QuestionCard";
import { StartPracticeButton } from "@/components/StartPracticeButton";
import { InterviewProgressChart, type ProgressPoint } from "@/components/InterviewProgressChart";
import type { QuestionSetResult } from "@/lib/ai";

export default async function JdInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireProfile();
  const { id } = await params;

  const jd = await db.jobDescription.findUnique({
    where: { id },
    include: { questionSet: true },
  });
  if (!jd || jd.userId !== user.id) notFound();

  const sessions = await db.interviewSession.findMany({
    where: { jdId: jd.id, userId: user.id },
    orderBy: { startedAt: "desc" },
    include: { turns: true },
  });

  const questions = jd.questionSet
    ? (jd.questionSet.questions as unknown as QuestionSetResult["questions"])
    : null;

  return (
    <div>
      <Link href={`/jd/${jd.id}`} className="text-sm text-muted hover:text-brand">
        ← {jd.title}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Interview practice</h1>
      <p className="mt-1 text-sm text-muted">
        Questions calibrated for {jd.industry} in your target market. Try your own answer before
        revealing what a strong one looks like.
      </p>

      {!questions ? (
        <div className="card mt-6 flex flex-col items-start gap-3 p-8">
          <p className="text-sm text-muted">No questions yet for this role.</p>
          <GenerateQuestionsButton jdId={jd.id} />
        </div>
      ) : (
        <>
          <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-muted">
              {questions.length} questions ready. Practice in the Dual-Tongue simulator for live
              coaching, or review the strong-answer notes below first.
            </p>
            <StartPracticeButton jdId={jd.id} defaultLanguage={user.profile.practiceLanguage} />
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {questions.map((q, i) => (
              <QuestionCard key={i} index={i} question={q.question} strongAnswerNote={q.strongAnswerNote} />
            ))}
          </div>

          <div className="mt-6">
            <GenerateQuestionsButton jdId={jd.id} regenerate />
          </div>
        </>
      )}

      {sessions.length > 0 && (
        <div className="mt-10 flex flex-col gap-6">
          <InterviewProgressChart data={buildProgressData(sessions)} />
          <div>
          <h2 className="text-lg font-semibold">Past sessions</h2>
          <div className="mt-3 flex flex-col gap-2">
            {sessions.map((s) => {
              const avg = (key: "contentScore" | "deliveryScore" | "culturalFitScore") => {
                if (s.turns.length === 0) return null;
                const sum = s.turns.reduce((acc, t) => {
                  const f = t.feedback as { contentScore: number; deliveryScore: number; culturalFitScore: number };
                  return acc + f[key];
                }, 0);
                return (sum / s.turns.length).toFixed(1);
              };
              return (
                <Link
                  key={s.id}
                  href={`/jd/${jd.id}/interview/session/${s.id}`}
                  className="card flex flex-wrap items-center justify-between gap-2 p-4 transition-colors hover:border-brand"
                >
                  <span className="text-sm">
                    {s.startedAt.toLocaleString()} · {s.turns.length} answered · language: {s.language}
                  </span>
                  <span className="text-sm text-muted">
                    content {avg("contentScore") ?? "–"} · delivery {avg("deliveryScore") ?? "–"} ·
                    cultural fit {avg("culturalFitScore") ?? "–"}
                  </span>
                </Link>
              );
            })}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildProgressData(
  sessions: {
    id: string;
    startedAt: Date;
    turns: { answerLanguage: string; feedback: unknown }[];
  }[]
): ProgressPoint[] {
  return [...sessions]
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
}
