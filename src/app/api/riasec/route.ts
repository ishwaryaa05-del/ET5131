import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { RIASEC_ITEMS, scoreRiasec } from "@/lib/riasec";
import { interpretRiasecCode, AIUnavailableError } from "@/lib/ai";

const schema = z.object({
  answers: z
    .array(z.object({ itemId: z.string(), score: z.number().int().min(1).max(5) }))
    .length(RIASEC_ITEMS.length),
});

export async function POST(request: Request) {
  const user = await requireProfile();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please answer every item before submitting." }, { status: 400 });
  }

  const { scores, code } = scoreRiasec(parsed.data.answers);

  let interpretation: {
    summary: string;
    strengths: string[];
    watchOuts: string[];
    marketNotes: string[];
  } = {
    summary: "",
    strengths: [],
    watchOuts: [],
    marketNotes: [],
  };
  let warning: string | undefined;

  try {
    interpretation = await interpretRiasecCode({
      code,
      scores,
      market: user.profile.market,
      industry: user.profile.industry,
    });
  } catch (err) {
    if (err instanceof AIUnavailableError) warning = err.message;
    else warning = "Couldn't generate the cultural interpretation right now.";
  }

  const result = await db.riasecResult.create({
    data: {
      userId: user.id,
      answers: parsed.data.answers,
      scores,
      code,
      interpretation,
    },
  });

  return NextResponse.json({ ok: true, result, warning });
}
