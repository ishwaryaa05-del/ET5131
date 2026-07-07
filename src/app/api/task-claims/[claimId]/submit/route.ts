import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/session";
import { computeReviewDeadline, precheckSubmission, type SubmissionContent } from "@/lib/sponsorExchange/business";
import { saveUploadedFile } from "@/lib/sponsorExchange/storage";
import { TASK_TIER_SUBMISSION_TYPE } from "@/lib/sponsorExchange/constants";

type Ctx = { params: Promise<{ claimId: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const user = await requireUser();
  const { claimId } = await ctx.params;

  const claim = await db.taskClaim.findUnique({ where: { id: claimId }, include: { task: true } });
  if (!claim || claim.studentId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (claim.status !== "CLAIMED") {
    return NextResponse.json({ error: "This task has already been submitted." }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let submissionType: "URL" | "FORM_RESPONSE" | "FILE";
  let content: SubmissionContent;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was attached." }, { status: 400 });
    }
    const saved = await saveUploadedFile(file);
    submissionType = "FILE";
    content = saved;
  } else {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }
    if (claim.task.tier === "FEEDBACK") {
      submissionType = "FORM_RESPONSE";
      content = { fields: body.fields ?? {} };
    } else if (typeof body.url === "string") {
      submissionType = "URL";
      content = { url: body.url };
    } else {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }
  }

  // Tier 1 defaults to a URL but allows a screenshot upload as a fallback when the work truly can't be linked.
  if (claim.task.tier === "VISIBILITY" && submissionType !== TASK_TIER_SUBMISSION_TYPE.VISIBILITY && submissionType !== "FILE") {
    return NextResponse.json({ error: "Invalid submission type for this task." }, { status: 400 });
  }

  const notes = await precheckSubmission({
    submissionType,
    content,
    formFields: claim.task.formFields as { key: string; label: string; required: boolean }[] | null,
  });

  if (notes.length > 0) {
    const updated = await db.taskClaim.update({
      where: { id: claim.id },
      data: {
        submissionType,
        submissionContent: content as unknown as Prisma.InputJsonValue,
        precheckNotes: notes,
      },
    });
    return NextResponse.json({ ok: false, notes, claim: updated }, { status: 200 });
  }

  const now = new Date();
  const updated = await db.taskClaim.update({
    where: { id: claim.id },
    data: {
      submissionType,
      submissionContent: content as unknown as Prisma.InputJsonValue,
      precheckNotes: Prisma.JsonNull,
      status: "SUBMITTED",
      submittedAt: now,
      reviewDeadline: computeReviewDeadline(now),
    },
  });

  return NextResponse.json({ ok: true, claim: updated });
}
