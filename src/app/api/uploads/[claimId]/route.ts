import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getCurrentSponsor } from "@/lib/sponsorSession";
import { readUploadedFile } from "@/lib/sponsorExchange/storage";

type Ctx = { params: Promise<{ claimId: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { claimId } = await ctx.params;

  const claim = await db.taskClaim.findUnique({ where: { id: claimId }, include: { task: true } });
  if (!claim || claim.submissionType !== "FILE" || !claim.submissionContent) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const [user, sponsor] = await Promise.all([getCurrentUser(), getCurrentSponsor()]);
  const isOwner = user && user.id === claim.studentId;
  const isSponsor = sponsor && sponsor.id === claim.task.sponsorId;
  if (!isOwner && !isSponsor) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const content = claim.submissionContent as { path: string; filename: string; size: number };
  const buffer = await readUploadedFile(content.path);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${content.filename.replace(/"/g, "")}"`,
      "Content-Length": String(content.size),
    },
  });
}
