import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { detectSkillGaps } from "@/lib/ai";
import { courseLinksForSkill } from "@/lib/courses";

const schema = z.object({
  jdId: z.string().min(1),
  resumeId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await requireProfile();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a job description and a resume." }, { status: 400 });
  }

  const [jd, resume] = await Promise.all([
    db.jobDescription.findUnique({ where: { id: parsed.data.jdId } }),
    db.resume.findUnique({ where: { id: parsed.data.resumeId } }),
  ]);
  if (!jd || jd.userId !== user.id || !resume || resume.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const { gaps } = await detectSkillGaps({ resumeText: resume.rawText, jdText: jd.rawText });
    const gapsWithCourses = gaps.map((g) => ({
      ...g,
      courses: courseLinksForSkill(g.skill, user.profile.market),
    }));

    const report = await db.skillGapReport.create({
      data: {
        userId: user.id,
        jdId: jd.id,
        resumeId: resume.id,
        gaps: gapsWithCourses,
      },
    });

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't detect skill gaps.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
