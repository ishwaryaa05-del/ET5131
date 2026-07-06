import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { tailorResume } from "@/lib/ai";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({ jdId: z.string().min(1) });

export async function POST(request: Request, ctx: Ctx) {
  const user = await requireProfile();
  const { id } = await ctx.params;

  const resume = await db.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a job description to tailor against." }, { status: 400 });
  }

  const jd = await db.jobDescription.findUnique({ where: { id: parsed.data.jdId } });
  if (!jd || jd.userId !== user.id) {
    return NextResponse.json({ error: "Job description not found." }, { status: 404 });
  }

  try {
    const result = await tailorResume({
      resumeText: resume.rawText,
      jdText: jd.rawText,
      market: user.profile.market,
      industry: jd.industry,
    });
    const updated = await db.resume.update({
      where: { id },
      data: { tailoring: { ...result, jdId: jd.id } },
    });
    return NextResponse.json({ ok: true, resume: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't tailor resume.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
