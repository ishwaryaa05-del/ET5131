import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSponsor } from "@/lib/sponsorSession";
import { computeAccessGrantedUntil } from "@/lib/sponsorExchange/business";

type Ctx = { params: Promise<{ claimId: string }> };

const schema = z.object({
  decision: z.enum(["approve", "reject"]),
  note: z.string().max(2000).optional(),
});

export async function POST(request: Request, ctx: Ctx) {
  const sponsor = await requireSponsor();
  const { claimId } = await ctx.params;

  const claim = await db.taskClaim.findUnique({
    where: { id: claimId },
    include: { task: true },
  });
  if (!claim || claim.task.sponsorId !== sponsor.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (claim.status !== "SUBMITTED" && claim.status !== "UNDER_REVIEW") {
    return NextResponse.json({ error: "This submission has already been reviewed." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review decision." }, { status: 400 });
  }

  const now = new Date();
  const updated = await db.taskClaim.update({
    where: { id: claimId },
    data: {
      status: parsed.data.decision === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: now,
      reviewer: sponsor.contactName,
      reviewNote: parsed.data.note ?? null,
      accessGrantedUntil: parsed.data.decision === "approve" ? computeAccessGrantedUntil(now) : null,
    },
  });

  return NextResponse.json({ ok: true, claim: updated });
}
