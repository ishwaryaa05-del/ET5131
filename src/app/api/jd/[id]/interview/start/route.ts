import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { LANGUAGE_VALUES } from "@/lib/constants";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  language: z.enum(LANGUAGE_VALUES).optional(),
});

export async function POST(request: Request, ctx: Ctx) {
  const user = await requireProfile();
  const { id } = await ctx.params;

  const jd = await db.jobDescription.findUnique({ where: { id } });
  if (!jd || jd.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const language = parsed.success && parsed.data.language ? parsed.data.language : user.profile.practiceLanguage;

  const session = await db.interviewSession.create({
    data: { userId: user.id, jdId: jd.id, language },
  });

  return NextResponse.json({ ok: true, session });
}
