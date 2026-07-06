import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { RiasecQuiz } from "@/components/RiasecQuiz";
import { RiasecResults } from "@/components/RiasecResults";
import { RetakeButton } from "@/components/RetakeButton";
import { MARKET_LABELS } from "@/lib/constants";
import type { RiasecDimension } from "@/lib/riasec";

export default async function RiasecPage({
  searchParams,
}: {
  searchParams: Promise<{ retake?: string }>;
}) {
  const user = await requireProfile();
  const { retake } = await searchParams;

  const latest = await db.riasecResult.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const showQuiz = retake === "1" || !latest;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">RIASEC Fit Assessment</h1>
          <p className="mt-1 text-sm text-muted">
            A standard, public-domain Holland Code interest inventory — layered with what it means
            in {MARKET_LABELS[user.profile.market]} workplace culture.
          </p>
        </div>
        {!showQuiz && <RetakeButton />}
      </div>

      <div className="mt-6">
        {showQuiz ? (
          <RiasecQuiz />
        ) : (
          <RiasecResults
            code={latest!.code}
            scores={latest!.scores as Record<RiasecDimension, number>}
            interpretation={
              latest!.interpretation as {
                summary: string;
                strengths: string[];
                watchOuts: string[];
                marketNotes: string[];
              }
            }
            market={MARKET_LABELS[user.profile.market]}
          />
        )}
      </div>
    </div>
  );
}
