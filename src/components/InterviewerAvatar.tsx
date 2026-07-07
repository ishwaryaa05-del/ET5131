import { initialsOf } from "@/lib/interviewer";

export type AvatarState = "idle" | "speaking" | "listening" | "thinking";

const STATE_LABEL: Record<AvatarState, string> = {
  idle: "Ready when you are",
  speaking: "Speaking…",
  listening: "Listening to you…",
  thinking: "Reviewing your answer…",
};

export function InterviewerAvatar({
  name,
  title,
  state,
  size = "md",
}: {
  name: string;
  title?: string;
  state: AvatarState;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-9 w-9 text-xs" : "h-14 w-14 text-base";

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        {state === "speaking" && (
          <span className="absolute -inset-1 animate-pulse rounded-full bg-brand/40 blur-sm" />
        )}
        {state === "listening" && (
          <span className="absolute -inset-1 animate-ping rounded-full border-2 border-brand/60" />
        )}
        <div
          className={`relative flex ${dims} items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-brand to-accent font-serif font-semibold text-white dark:border-white/10`}
        >
          {initialsOf(name)}
        </div>
      </div>
      {title !== undefined && (
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted">
            {title} · {STATE_LABEL[state]}
          </p>
        </div>
      )}
    </div>
  );
}
