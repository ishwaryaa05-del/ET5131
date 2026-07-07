"use client";

import { useId } from "react";

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
  const gradientId = useId();
  const dims = size === "sm" ? "h-9 w-9" : "h-14 w-14";

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        {state === "speaking" && (
          <span className="absolute -inset-1 animate-pulse rounded-full bg-brand/40 blur-sm" />
        )}
        {state === "listening" && (
          <span className="absolute -inset-1 animate-ping rounded-full border-2 border-brand/60" />
        )}
        <svg
          viewBox="0 0 100 100"
          className={`relative ${dims} rounded-full border border-white/50 dark:border-white/10 avatar-face-${state}`}
          role="img"
          aria-label={`${name}, ${STATE_LABEL[state]}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
          <ellipse className="avatar-eye" cx="34" cy="44" rx="5.5" ry="7.5" fill="white" />
          <ellipse className="avatar-eye" cx="66" cy="44" rx="5.5" ry="7.5" fill="white" />
          <rect className="avatar-mouth" x="36" y="64" width="28" height="7" rx="3.5" fill="white" />
        </svg>
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
