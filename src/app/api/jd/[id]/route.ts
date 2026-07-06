import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ROLE_LEVEL_VALUES } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  industry: z.string().min(1).max(120).optional(),
  roleLevel: z.enum(ROLE_LEVEL_VALUES).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const jd = await db.jobDescription.findUnique({ where: { id } });
  if (!jd || jd.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const updated = await db.jobDescription.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ ok: true, jd: updated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const jd = await db.jobDescription.findUnique({ where: { id } });
  if (!jd || jd.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await db.jobDescription.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
