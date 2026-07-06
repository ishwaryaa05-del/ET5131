import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { generateInterviewQuestions } from "@/lib/ai";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const user = await requireProfile();
  const { id } = await ctx.params;

  const jd = await db.jobDescription.findUnique({ where: { id } });
  if (!jd || jd.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const result = await generateInterviewQuestions({
      jdText: jd.rawText,
      market: user.profile.market,
      industry: jd.industry,
      roleLevel: jd.roleLevel,
    });

    const set = await db.interviewQuestionSet.upsert({
      where: { jdId: jd.id },
      update: { questions: result.questions },
      create: { jdId: jd.id, questions: result.questions },
    });

    return NextResponse.json({ ok: true, questionSet: set });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't generate questions.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
