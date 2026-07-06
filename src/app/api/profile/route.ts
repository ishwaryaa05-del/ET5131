import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { MARKET_VALUES, LANGUAGE_VALUES } from "@/lib/constants";

const schema = z.object({
  market: z.enum(MARKET_VALUES),
  industry: z.string().min(2).max(120),
  practiceLanguage: z.enum(LANGUAGE_VALUES),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
  }

  const profile = await db.profile.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json({ ok: true, profile });
}
