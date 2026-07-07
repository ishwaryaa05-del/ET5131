import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  verifyPassword,
  signSponsorSession,
  SPONSOR_SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/auth";

const schema = z.object({
  contactEmail: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const { contactEmail, password } = parsed.data;

  const sponsor = await db.sponsor.findUnique({ where: { contactEmail } });
  if (!sponsor || !(await verifyPassword(password, sponsor.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

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
