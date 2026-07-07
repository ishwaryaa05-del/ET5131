import { NextResponse } from "next/server";
import { SPONSOR_SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SPONSOR_SESSION_COOKIE_NAME);
  return response;
}
