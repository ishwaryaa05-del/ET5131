import { db } from "@/lib/db";
import {
  ACCESS_GRANT_DURATION_DAYS,
  REVIEW_WINDOW_BUSINESS_DAYS,
  ACCESS_EXPIRY_WARNING_DAYS,
  ADMIN_DEADLINE_SOON_DAYS,
  DEFAULT_TIER2_FORM_FIELDS,
} from "@/lib/sponsorExchange/constants";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Adds N business days (Mon-Fri) to a date, skipping weekends. */
export function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    result.setTime(result.getTime() + DAY_MS);
    const day = result.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
}

export function computeReviewDeadline(from: Date = new Date()): Date {
  return addBusinessDays(from, REVIEW_WINDOW_BUSINESS_DAYS);
}

export function computeAccessGrantedUntil(from: Date = new Date()): Date {
  return new Date(from.getTime() + ACCESS_GRANT_DURATION_DAYS * DAY_MS);
}

/**
 * Finds claims whose review deadline has passed while still awaiting review
 * and flips them to AUTO_APPROVED with access granted. This app has no
 * standing background worker, so this runs lazily whenever a relevant page
 * loads (student dashboard, sponsor queue, admin view) — correct as soon as
 * someone next looks, not instantaneous at the exact deadline. A real
 * deployment could instead point a scheduled job at a small wrapper around
 * this same function.
 */
export async function resolveAutoApprovals(): Promise<number> {
  const now = new Date();
  const overdue = await db.taskClaim.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      reviewDeadline: { lt: now },
    },
  });

  for (const claim of overdue) {
    await db.taskClaim.update({
      where: { id: claim.id },
      data: {
        status: "AUTO_APPROVED",
        reviewedAt: now,
        reviewer: "auto",
        accessGrantedUntil: computeAccessGrantedUntil(now),
      },
    });
  }

  return overdue.length;
}

/** Whether an access expiry falls within the opt-in "renew soon" warning window. */
export function isExpiringSoon(accessUntil: Date | null): boolean {
  if (!accessUntil) return false;
  const daysLeft = Math.ceil((accessUntil.getTime() - Date.now()) / DAY_MS);
  return daysLeft <= ACCESS_EXPIRY_WARNING_DAYS;
}

/** Cutoff for the admin view's "about to auto-approve" list. */
export function computeDeadlineSoonCutoff(from: Date = new Date()): Date {
  return new Date(from.getTime() + ADMIN_DEADLINE_SOON_DAYS * DAY_MS);
}

/** The student's current access expiry, if any — the latest across all their approved claims. */
export async function getCurrentAccessUntil(studentId: string): Promise<Date | null> {
  const latest = await db.taskClaim.findFirst({
    where: {
      studentId,
      status: { in: ["APPROVED", "AUTO_APPROVED"] },
      accessGrantedUntil: { not: null },
    },
    orderBy: { accessGrantedUntil: "desc" },
  });
  return latest?.accessGrantedUntil ?? null;
}

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^169\.254\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^\[?::1\]?$/,
];

function isPrivateHostname(hostname: string): boolean {
  return PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

async function precheckUrl(url: string): Promise<string[]> {
  const notes: string[] = [];
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return ["That doesn't look like a valid URL. Include the full link, e.g. https://..."];
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return ["The link must start with http:// or https://."];
  }
  if (isPrivateHostname(parsed.hostname)) {
    return ["That URL isn't a publicly reachable address."];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    let res = await fetch(parsed.toString(), { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (!res.ok && (res.status === 405 || res.status === 501)) {
      res = await fetch(parsed.toString(), { method: "GET", redirect: "follow", signal: controller.signal });
    }
    if (!res.ok) {
      notes.push(`The link responded with an error (status ${res.status}). Double-check it's public.`);
    }
  } catch {
    notes.push("Couldn't reach that URL. Check it's spelled correctly and publicly accessible (not private/login-only).");
  } finally {
    clearTimeout(timeout);
  }
  return notes;
}

function precheckFormResponse(
  fields: Record<string, string> | undefined,
  formFields: { key: string; label: string; required: boolean }[] | null
): string[] {
  const definitions = formFields && formFields.length > 0 ? formFields : DEFAULT_TIER2_FORM_FIELDS;
  const notes: string[] = [];
  for (const field of definitions) {
    if (field.required && !fields?.[field.key]?.trim()) {
      notes.push(`"${field.label}" is required.`);
    }
  }
  return notes;
}

function precheckFile(file: { size: number; filename: string } | undefined): string[] {
  if (!file || !file.filename) return ["No file was attached."];
  if (file.size <= 0) return ["The attached file appears to be empty."];
  return [];
}

export type SubmissionContent =
  | { url: string }
  | { fields: Record<string, string> }
  | { path: string; filename: string; size: number };

/** Runs the automated pre-check appropriate to the tier's submission type. Empty array = passed. */
export async function precheckSubmission(opts: {
  submissionType: "URL" | "FORM_RESPONSE" | "FILE";
  content: SubmissionContent;
  formFields?: { key: string; label: string; required: boolean }[] | null;
}): Promise<string[]> {
  if (opts.submissionType === "URL" && "url" in opts.content) {
    return precheckUrl(opts.content.url);
  }
  if (opts.submissionType === "FORM_RESPONSE" && "fields" in opts.content) {
    return precheckFormResponse(opts.content.fields, opts.formFields ?? null);
  }
  if (opts.submissionType === "FILE" && "path" in opts.content) {
    return precheckFile(opts.content);
  }
  return ["Submission content didn't match the expected type."];
}
