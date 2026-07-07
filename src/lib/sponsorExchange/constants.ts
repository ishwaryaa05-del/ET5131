export const TASK_TIER_VALUES = ["VISIBILITY", "FEEDBACK", "APPLIED_PROJECT"] as const;
export type TaskTierValue = (typeof TASK_TIER_VALUES)[number];

export const TASK_TIER_LABELS: Record<TaskTierValue, string> = {
  VISIBILITY: "Tier 1 · Visibility",
  FEEDBACK: "Tier 2 · Feedback",
  APPLIED_PROJECT: "Tier 3 · Applied Project",
};

export const TASK_TIER_DESCRIPTIONS: Record<TaskTierValue, string> = {
  VISIBILITY: "Student shares something publicly (e.g. a short post) crediting the sponsor.",
  FEEDBACK: "Student fills out a structured feedback form on a sponsor tool/material.",
  APPLIED_PROJECT: "Student delivers a scoped work product (doc, deck, or dataset).",
};

/** Hour cap is determined entirely by tier — sponsors cannot set a custom value. */
export const TASK_TIER_HOUR_CAPS: Record<TaskTierValue, number> = {
  VISIBILITY: 2,
  FEEDBACK: 2,
  APPLIED_PROJECT: 5,
};

/** Which submission type each tier uses by default. Tier 1 may fall back to FILE. */
export const TASK_TIER_SUBMISSION_TYPE: Record<TaskTierValue, "URL" | "FORM_RESPONSE" | "FILE"> = {
  VISIBILITY: "URL",
  FEEDBACK: "FORM_RESPONSE",
  APPLIED_PROJECT: "FILE",
};

/** How long approved/auto-approved access lasts. One place to change "a semester". */
export const ACCESS_GRANT_DURATION_DAYS = 182;

/** Sponsors get this many business days to review before a submission auto-approves. */
export const REVIEW_WINDOW_BUSINESS_DAYS = 5;

/** Students are prompted (never forced) to claim a new task once access is this close to expiring. */
export const ACCESS_EXPIRY_WARNING_DAYS = 14;

/** Claims still open for review within this many days of their deadline are "about to auto-approve". */
export const ADMIN_DEADLINE_SOON_DAYS = 2;

export const DEFAULT_TIER2_FORM_FIELDS: { key: string; label: string; required: boolean }[] = [
  { key: "whatWorked", label: "What worked", required: true },
  { key: "whatDidnt", label: "What didn't work", required: true },
  { key: "suggestedChange", label: "Suggested change", required: true },
];
