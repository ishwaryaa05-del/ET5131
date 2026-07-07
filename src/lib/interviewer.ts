import type { MarketValue } from "@/lib/constants";

export type Interviewer = { name: string; title: string };

const PERSONAS: Record<MarketValue, Interviewer[]> = {
  SINGAPORE: [
    { name: "Rachel Tan", title: "Senior Talent Partner" },
    { name: "Marcus Lim", title: "Hiring Manager" },
  ],
  MALAYSIA: [
    { name: "Aisyah Rahman", title: "Talent Acquisition Lead" },
    { name: "Wei Jian Ong", title: "Hiring Manager" },
  ],
  MYANMAR: [
    { name: "Su Su Aung", title: "HR Business Partner" },
    { name: "Kyaw Zin", title: "Hiring Manager" },
  ],
};

/** Deterministically picks a persona so it stays stable for a given session. */
export function pickInterviewer(market: MarketValue, seed: string): Interviewer {
  const options = PERSONAS[market];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return options[hash % options.length];
}
