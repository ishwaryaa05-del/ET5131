import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { getDualTongueFeedback } from "@/lib/ai";
import { LANGUAGE_VALUES } from "@/lib/constants";
import type { QuestionSetResult } from "@/lib/ai";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  questionIndex: z.number().int().min(0),
  answerText: z.string().min(1).max(6000),
  answerLanguage: z.enum(LANGUAGE_VALUES),
});

export async function POST(request: Request, ctx: Ctx) {
  const user = await requireProfile();
  const { id } = await ctx.params;

  const session = await db.interviewSession.findUnique({
    where: { id },
    include: { jd: { include: { questionSet: true } } },
  });
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!session.jd.questionSet) {
    return NextResponse.json({ error: "No questions generated for this JD yet." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please write an answer before submitting." }, { status: 400 });
  }

  const questions = session.jd.questionSet.questions as unknown as QuestionSetResult["questions"];
  const question = questions[parsed.data.questionIndex];
  if (!question) {
    return NextResponse.json({ error: "Invalid question." }, { status: 400 });
  }

  try {
    const feedback = await getDualTongueFeedback({
      question: question.question,
      strongAnswerNote: question.strongAnswerNote,
      answerText: parsed.data.answerText,
      answerLanguage: parsed.data.answerLanguage,
      market: user.profile.market,
      industry: session.jd.industry,
    });

    const turn = await db.interviewTurn.create({
      data: {
        sessionId: session.id,
        questionIndex: parsed.data.questionIndex,
        questionText: question.question,
        answerText: parsed.data.answerText,
        answerLanguage: parsed.data.answerLanguage,
        feedback,
      },
    });

    return NextResponse.json({ ok: true, turn });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't get feedback.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
