import type { TaskTierValue } from "@/lib/sponsorExchange/constants";

/**
 * The three fixed agreement templates, one per tier. Sponsors and students
 * cannot edit this text — the tier alone determines which template applies.
 * Bump `version` (and keep the old text somewhere in history/VCS) whenever
 * the wording changes; every TaskClaim records the version a student
 * actually accepted, so old claims stay auditable against old wording.
 */
export const AGREEMENTS: Record<TaskTierValue, { version: number; title: string; text: string }> = {
  VISIBILITY: {
    version: 1,
    title: "Content Release Agreement (Tier 1 · Visibility)",
    text: `This is a content release, not a non-disclosure agreement — it does not restrict what you can say or share.

By submitting this task, you confirm that:

1. The content you're submitting (e.g. a post, article, or public write-up) is your own original work.
2. You grant CareerBridge ASEAN and the sponsoring company a non-exclusive, royalty-free right to reshare, quote, or reference your submitted content for promotional and reporting purposes, with credit to you.
3. Your content does not contain defamatory, misleading, or knowingly false claims about the sponsor, CareerBridge ASEAN, or any third party.
4. You are not disclosing any confidential or non-public information about the sponsor unless the sponsor has explicitly told you it's shareable.

This agreement does not create any employment relationship, and does not obligate you to keep anything confidential beyond what's stated above.`,
  },
  FEEDBACK: {
    version: 1,
    title: "Mutual Confidentiality Agreement (Tier 2 · Feedback)",
    text: `To give useful feedback, the sponsor may show you material that isn't public yet (e.g. an unreleased product, prototype, or internal document).

By submitting this task, you agree that:

1. Any non-public material shared with you specifically for this task ("the Material") will be kept confidential and not shared, published, or discussed outside of your feedback submission.
2. This confidentiality obligation applies only to the specific Material shared for this task — not to general knowledge, publicly available information, or anything you already knew beforehand.
3. This obligation expires 2 years from the date you accept this agreement, or immediately if the sponsor makes the Material public themselves, whichever comes first.
4. The sponsor agrees to treat your submitted feedback as coming from you in good faith and will not use it against your interests.

This agreement does not create any employment relationship. Your feedback submission itself is treated as your completed proof of work — no separate verification step is required.`,
  },
  APPLIED_PROJECT: {
    version: 1,
    title: "Applied Project Agreement (Tier 3 · Applied Project)",
    text: `This task involves a scoped deliverable (e.g. a document, deck, or dataset) capped at a fixed number of hours. It is a bounded learning project, not a job.

By submitting this task, you agree that:

1. Any non-public material the sponsor shares with you for this task ("the Material") will be kept confidential and not shared, published, or discussed outside of your submission, for 2 years from acceptance or until the sponsor makes it public, whichever comes first — the same confidentiality terms as the Tier 2 Feedback agreement.
2. The deliverable you submit for this specific task becomes the property of the sponsor once approved.
3. This is explicitly NOT an employment relationship and NOT "work made for hire" in the legal sense of ongoing employment — it is a single, hour-capped learning exchange. Completing this task does not make you an employee, contractor, or agent of the sponsor, and does not entitle you to wages, benefits, or continued work.
4. The scope is limited to what's described in the task; the sponsor will not ask you to exceed the stated hour cap for this task.

Access granted through CareerBridge ASEAN in exchange for this task is never contingent on further work — it is a one-time exchange for this specific, bounded deliverable.`,
  },
};

export function getAgreement(tier: TaskTierValue) {
  return AGREEMENTS[tier];
}
