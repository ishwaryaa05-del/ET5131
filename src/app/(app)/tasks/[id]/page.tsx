import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { resolveAutoApprovals } from "@/lib/sponsorExchange/business";
import { getAgreement } from "@/lib/sponsorExchange/agreements";
import { TASK_TIER_LABELS, DEFAULT_TIER2_FORM_FIELDS } from "@/lib/sponsorExchange/constants";
import { TaskClaimForm } from "@/components/TaskClaimForm";
import { TaskSubmissionForm } from "@/components/TaskSubmissionForm";

type Ctx = { params: Promise<{ id: string }> };

const STATUS_MESSAGES: Record<string, string> = {
  SUBMITTED: "Your submission is waiting on the sponsor's review.",
  UNDER_REVIEW: "Your submission is being reviewed.",
  APPROVED: "Approved! Your access has been extended.",
  AUTO_APPROVED: "The sponsor didn't review in time, so this was auto-approved. Your access has been extended.",
  REJECTED: "This submission was rejected.",
};

export default async function TaskDetailPage({ params }: Ctx) {
  const user = await requireUser();
  const { id } = await params;
  await resolveAutoApprovals();

  const task = await db.task.findUnique({
    where: { id },
    include: { sponsor: true },
  });
  if (!task) notFound();

  const claim = await db.taskClaim.findUnique({
    where: { taskId_studentId: { taskId: task.id, studentId: user.id } },
  });

  const agreement = getAgreement(task.tier);
  const formFields =
    task.tier === "FEEDBACK"
      ? ((task.formFields as { key: string; label: string; required: boolean }[] | null) ?? DEFAULT_TIER2_FORM_FIELDS)
      : [];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
        <span className="badge shrink-0">{TASK_TIER_LABELS[task.tier]}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {task.sponsor.companyName} · {task.sponsor.industry}
      </p>

      <div className="card mt-6 p-5">
        <p className="whitespace-pre-wrap text-sm">{task.description}</p>
        <p className="mt-3 text-xs text-muted">
          {task.seatCap - task.seatsClaimed} of {task.seatCap} seats left · {task.hourCap}h cap
        </p>
      </div>

      <div className="mt-6">
        {!claim && task.status === "OPEN" && (
          <TaskClaimForm taskId={task.id} agreementText={`${agreement.title}\n\n${agreement.text}`} />
        )}
        {!claim && task.status !== "OPEN" && (
          <p className="card p-6 text-sm text-muted">All seats for this task have been claimed.</p>
        )}

        {claim && claim.status === "CLAIMED" && (
          <div className="flex flex-col gap-4">
            {claim.precheckNotes && Array.isArray(claim.precheckNotes) && claim.precheckNotes.length > 0 && (
              <div className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                <p className="font-medium">Your last submission needs fixes:</p>
                <ul className="mt-1 list-inside list-disc">
                  {(claim.precheckNotes as string[]).map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
            <TaskSubmissionForm claimId={claim.id} tier={task.tier} formFields={formFields} />
          </div>
        )}

        {claim && claim.status !== "CLAIMED" && (
          <div className="card p-6">
            <p className="text-sm font-medium">{STATUS_MESSAGES[claim.status] ?? claim.status}</p>
            {claim.reviewDeadline && (claim.status === "SUBMITTED" || claim.status === "UNDER_REVIEW") && (
              <p className="mt-1 text-xs text-muted">
                Review by {new Date(claim.reviewDeadline).toLocaleDateString()}
              </p>
            )}
            {claim.accessGrantedUntil && (
              <p className="mt-1 text-xs text-muted">
                Access granted until {new Date(claim.accessGrantedUntil).toLocaleDateString()}
              </p>
            )}
            {claim.reviewNote && <p className="mt-2 text-sm text-muted">Note: {claim.reviewNote}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
