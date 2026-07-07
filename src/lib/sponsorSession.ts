import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SPONSOR_SESSION_COOKIE_NAME, verifySponsorSession } from "@/lib/auth";

export async function getCurrentSponsor() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SPONSOR_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySponsorSession(token);
  if (!payload) return null;

  return db.sponsor.findUnique({ where: { id: payload.sponsorId } });
}

export async function requireSponsor() {
  const sponsor = await getCurrentSponsor();
  if (!sponsor) redirect("/sponsor/login");
  return sponsor;
}
