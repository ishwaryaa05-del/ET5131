import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { requireSponsor } from "@/lib/sponsorSession";
import { TASK_TIER_VALUES, TASK_TIER_HOUR_CAPS } from "@/lib/sponsorExchange/constants";

const schema = z.object({
  tier: z.enum(TASK_TIER_VALUES),
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(4000),
  seatCap: z.number().int().min(1).max(500),
  formFields: z
    .array(z.object({ key: z.string().min(1), label: z.string().min(1), required: z.boolean() }))
    .max(10)
    .optional(),
});

export async function POST(request: Request) {
  const sponsor = await requireSponsor();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  const { tier, title, description, seatCap, formFields } = parsed.data;

  const task = await db.task.create({
    data: {
      sponsorId: sponsor.id,
      tier,
      title,
      description,
      seatCap,
      hourCap: TASK_TIER_HOUR_CAPS[tier], // tier decides this — never sponsor input
      formFields: tier === "FEEDBACK" && formFields ? formFields : Prisma.JsonNull,
    },
  });

  return NextResponse.json({ ok: true, task });
}
