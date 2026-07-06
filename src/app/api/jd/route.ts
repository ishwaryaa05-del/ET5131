import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { extractPdfText } from "@/lib/pdf";
import { tagJobDescription, AIUnavailableError } from "@/lib/ai";
import { ROLE_LEVEL_VALUES } from "@/lib/constants";

export async function POST(request: Request) {
  const user = await requireUser();

  const contentType = request.headers.get("content-type") ?? "";
  let rawText = "";
  let source: "pasted" | "pdf" = "pasted";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const text = form.get("text");
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
  }

  rawText = rawText.trim();
  if (rawText.length < 40) {
    return NextResponse.json(
      { error: "Please paste or upload a fuller job description (at least a few sentences)." },
      { status: 400 }
    );
  }
  if (rawText.length > 20000) {
    rawText = rawText.slice(0, 20000);
  }

  try {
    const tags = await tagJobDescription(rawText);
    const jd = await db.jobDescription.create({
      data: {
        userId: user.id,
        rawText,
        title: tags.title,
        industry: tags.industry,
        roleLevel: ROLE_LEVEL_VALUES.includes(tags.roleLevel) ? tags.roleLevel : "ENTRY_LEVEL",
        source,
      },
    });
    return NextResponse.json({ ok: true, jd });
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      // Still save the JD so the student doesn't lose their paste; tag it manually.
      const jd = await db.jobDescription.create({
        data: {
          userId: user.id,
          rawText,
          title: "Untitled role",
          industry: user.profile?.industry ?? "General",
          roleLevel: "ENTRY_LEVEL",
          source,
        },
      });
      return NextResponse.json({ ok: true, jd, warning: err.message });
    }
    return NextResponse.json({ error: "Couldn't process that job description. Please try again." }, { status: 500 });
  }
}
