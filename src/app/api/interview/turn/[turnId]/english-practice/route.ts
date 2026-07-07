import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getEnglishPracticeFeedback, type DualTongueFeedback } from "@/lib/ai";

type Ctx = { params: Promise<{ turnId: string }> };

const schema = z.object({
  attemptText: z.string().min(1).max(6000),
});

export async function POST(request: Request, ctx: Ctx) {
  const user = await requireUser();
  const { turnId } = await ctx.params;

  const turn = await db.interviewTurn.findUnique({
    where: { id: turnId },
    include: { session: true },
  });
  if (!turn || turn.session.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please attempt the model answer before submitting." }, { status: 400 });
  }

  const modelAnswer = (turn.feedback as unknown as DualTongueFeedback).modelEnglishAnswer;
  if (!modelAnswer) {
    return NextResponse.json({ error: "No model English answer available for this turn." }, { status: 400 });
  }

  try {
    const feedback = await getEnglishPracticeFeedback({
      modelAnswer,
      attemptText: parsed.data.attemptText,
    });

    const englishPractice = { attemptText: parsed.data.attemptText, feedback };
    await db.interviewTurn.update({
      where: { id: turnId },
      data: { englishPractice },
    });

    return NextResponse.json({ ok: true, englishPractice });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't get feedback.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
