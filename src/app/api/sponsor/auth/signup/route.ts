import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  hashPassword,
  signSponsorSession,
  SPONSOR_SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/auth";

const schema = z.object({
  companyName: z.string().min(1).max(160),
  industry: z.string().min(1).max(120),
  contactName: z.string().min(1).max(120),
  contactEmail: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields (password min 8 characters)." }, { status: 400 });
  }
  const { companyName, industry, contactName, contactEmail, password } = parsed.data;

  const existing = await db.sponsor.findUnique({ where: { contactEmail } });
  if (existing) {
    return NextResponse.json({ error: "A sponsor account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const sponsor = await db.sponsor.create({
    data: { companyName, industry, contactName, contactEmail, passwordHash },
  });

  const token = signSponsorSession({
    sponsorId: sponsor.id,
    contactEmail: sponsor.contactEmail,
    companyName: sponsor.companyName,
  });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SPONSOR_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return response;
}
