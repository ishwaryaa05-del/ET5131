import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { extractPdfText } from "@/lib/pdf";
import { tailorResume, AIUnavailableError } from "@/lib/ai";

export async function POST(request: Request) {
  const user = await requireProfile();

  const contentType = request.headers.get("content-type") ?? "";
  let rawText = "";
  let source: "pasted" | "pdf" = "pasted";
  let jdId: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const text = form.get("text");
    const jdIdField = form.get("jdId");
    if (typeof jdIdField === "string" && jdIdField) jdId = jdIdField;

    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await extractPdfText(buffer);
      source = "pdf";
    } else if (typeof text === "string") {
      rawText = text;
    }
  } else {
    const body = await request.json().catch(() => null);
    if (typeof body?.text === "string") rawText = body.text;
    if (typeof body?.jdId === "string" && body.jdId) jdId = body.jdId;
  }

  rawText = rawText.trim();
  if (rawText.length < 40) {
    return NextResponse.json(
      { error: "Please paste or upload a fuller resume (at least a few lines)." },
      { status: 400 }
    );
  }
  if (rawText.length > 20000) rawText = rawText.slice(0, 20000);

  let tailoring: unknown = null;
  let warning: string | undefined;

  if (jdId) {
    const jd = await db.jobDescription.findUnique({ where: { id: jdId } });
    if (jd && jd.userId === user.id) {
      try {
        const result = await tailorResume({
          resumeText: rawText,
          jdText: jd.rawText,
          market: user.profile.market,
          industry: jd.industry,
        });
        tailoring = { ...result, jdId: jd.id };
      } catch (err) {
        if (err instanceof AIUnavailableError) warning = err.message;
        else warning = "Couldn't tailor against that JD right now, but your resume was saved.";
      }
    }
  }

  const resume = await db.resume.create({
    data: { userId: user.id, rawText, source, tailoring: tailoring ?? undefined },
  });

  return NextResponse.json({ ok: true, resume, warning });
}
