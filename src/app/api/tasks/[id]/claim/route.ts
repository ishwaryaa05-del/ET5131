import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getAgreement } from "@/lib/sponsorExchange/agreements";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  agreementAccepted: z.literal(true),
});

export async function POST(request: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "You must accept the agreement to claim this task." }, { status: 400 });
  }

  const task = await db.task.findUnique({ where: { id } });
  if (!task || task.status !== "OPEN") {
    return NextResponse.json({ error: "This task isn't open for claims." }, { status: 404 });
  }

  const existing = await db.taskClaim.findUnique({
    where: { taskId_studentId: { taskId: task.id, studentId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You've already claimed this task." }, { status: 400 });
  }

  if (task.seatsClaimed >= task.seatCap) {
    return NextResponse.json({ error: "All seats for this task have been claimed." }, { status: 400 });
  }

  const agreement = getAgreement(task.tier);

  const claim = await db.$transaction(async (tx) => {
    const created = await tx.taskClaim.create({
      data: {
        taskId: task.id,
        studentId: user.id,
        agreementVersion: agreement.version,
      },
    });
    const seatsClaimed = task.seatsClaimed + 1;
    await tx.task.update({
      where: { id: task.id },
      data: {
        seatsClaimed,
        status: seatsClaimed >= task.seatCap ? "CLOSED" : task.status,
      },
    });
    return created;
  });

  return NextResponse.json({ ok: true, claim });
}
