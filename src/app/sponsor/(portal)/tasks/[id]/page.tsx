import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSponsor } from "@/lib/sponsorSession";
import { resolveAutoApprovals } from "@/lib/sponsorExchange/business";
import { TASK_TIER_LABELS } from "@/lib/sponsorExchange/constants";
import { SponsorClaimReview } from "@/components/SponsorClaimReview";

type Ctx = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<string, string> = {
  CLAIMED: "Claimed",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  AUTO_APPROVED: "Auto-approved",
};

function SubmissionView({
  claim,
}: {
  claim: { id: string; submissionType: string | null; submissionContent: unknown };
}) {
  if (!claim.submissionType || !claim.submissionContent) {
    return <p className="text-sm text-muted">No submission yet.</p>;
  }
  const content = claim.submissionContent as Record<string, unknown>;

  if (claim.submissionType === "URL" && typeof content.url === "string") {
    return (
      <a href={content.url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
        {content.url}
      </a>
    );
  }

  if (claim.submissionType === "FORM_RESPONSE" && content.fields && typeof content.fields === "object") {
    const fields = content.fields as Record<string, string>;
    return (
      <dl className="flex flex-col gap-2">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{key}</dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (claim.submissionType === "FILE" && typeof content.filename === "string") {
    return (
      <a href={`/api/uploads/${claim.id}`} className="text-sm text-accent hover:underline">
        Download {content.filename}
      </a>
    );
  }

  return <p className="text-sm text-muted">Unrecognized submission.</p>;
}

export default async function SponsorTaskDetailPage({ params }: Ctx) {
  const sponsor = await requireSponsor();
  const { id } = await params;
  await resolveAutoApprovals();

  const task = await db.task.findUnique({
    where: { id },
    include: { claims: { include: { student: true }, orderBy: { claimedAt: "desc" } } },
  });

  if (!task || task.sponsorId !== sponsor.id) {
    notFound();
  }

  const needsReview = task.claims.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW");
  const otherClaims = task.claims.filter((c) => c.status !== "SUBMITTED" && c.status !== "UNDER_REVIEW");

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
        <span className="badge shrink-0">{task.status}</span>
      </div>
      <p className="mt-1 text-sm text-muted">{TASK_TIER_LABELS[task.tier]}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Seats</p>
          <p className="mt-2 text-2xl font-semibold">
            {task.seatsClaimed} / {task.seatCap}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Hour cap</p>
          <p className="mt-2 text-2xl font-semibold">{task.hourCap}h</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Needs review</p>
          <p className="mt-2 text-2xl font-semibold">{needsReview.length}</p>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm">{task.description}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Needs review</h2>
        {needsReview.length === 0 ? (
          <p className="card mt-4 p-6 text-sm text-muted">Nothing waiting on you right now.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {needsReview.map((c) => (
              <div key={c.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.student.name}</p>
                  <span className="text-xs text-muted">
                    Submitted {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"} · review by{" "}
                    {c.reviewDeadline ? new Date(c.reviewDeadline).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="mt-3">
                  <SubmissionView claim={c} />
                </div>
                <SponsorClaimReview claimId={c.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {otherClaims.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Other claims</h2>
          <div className="mt-4 flex flex-col gap-2">
            {otherClaims.map((c) => (
              <div key={c.id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
                <span className="text-sm font-medium">{c.student.name}</span>
                <span className="text-xs text-muted">{STATUS_LABELS[c.status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
