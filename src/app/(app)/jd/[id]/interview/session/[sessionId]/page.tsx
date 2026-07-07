import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { InterviewSimulator } from "@/components/InterviewSimulator";
import type { QuestionSetResult } from "@/lib/ai";
import type { LanguageValue } from "@/lib/constants";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const user = await requireProfile();
  const { id, sessionId } = await params;

  const session = await db.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      jd: { include: { questionSet: true } },
      turns: { orderBy: { questionIndex: "asc" } },
    },
  });
  if (!session || session.userId !== user.id || session.jdId !== id || !session.jd.questionSet) {
    notFound();
  }

  const questions = session.jd.questionSet.questions as unknown as QuestionSetResult["questions"];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/jd/${id}/interview`} className="text-sm text-muted hover:text-brand">
        ← Interview practice
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Dual-Tongue practice session</h1>
      <p className="mt-1 text-sm text-muted">{session.jd.title}</p>

      <div className="mt-6">
        <InterviewSimulator
          sessionId={session.id}
          jdId={id}
          questions={questions}
          initialTurns={session.turns.map((t) => ({
            questionIndex: t.questionIndex,
            questionText: t.questionText,
            answerText: t.answerText,
            answerLanguage: t.answerLanguage as LanguageValue,
            feedback: t.feedback as {
              contentScore: number;
              deliveryScore: number;
              culturalFitScore: number;
              summary: string;
              dualTongueNotes: { original: string; issue: string; suggestedEnglish: string }[];
            },
          }))}
          defaultLanguage={session.language as LanguageValue}
          market={user.profile.market}
        />
      </div>
    </div>
  );
}
