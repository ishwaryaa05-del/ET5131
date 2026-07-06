export type RiasecDimension = "R" | "I" | "A" | "S" | "E" | "C";

export const DIMENSION_LABELS: Record<RiasecDimension, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export const DIMENSION_BLURBS: Record<RiasecDimension, string> = {
  R: "Hands-on, mechanical, building or fixing things.",
  I: "Analytical, research-driven, solving complex problems.",
  A: "Creative, expressive, original ideas and design.",
  S: "Helping, teaching, working closely with people.",
  E: "Leading, persuading, starting or growing ventures.",
  C: "Organized, detail-oriented, structured processes and data.",
};

export type RiasecItem = {
  id: string;
  dimension: RiasecDimension;
  text: string;
};

const DIMENSIONS: RiasecDimension[] = ["R", "I", "A", "S", "E", "C"];

const ITEM_TEXT: Record<RiasecDimension, string[]> = {
  R: [
    "Repairing or assembling mechanical or electronic equipment",
    "Working outdoors with tools, machines, or materials",
    "Building or constructing something with your hands",
    "Operating vehicles, heavy machinery, or lab/production equipment",
    "Following a step-by-step technical or physical process to completion",
    "Diagnosing why a physical system or device isn't working",
  ],
  I: [
    "Investigating why something happens by gathering and analyzing evidence",
    "Solving abstract, logical, or mathematical problems",
    "Reading deeply into a scientific or technical topic out of curiosity",
    "Designing an experiment or a way to test an idea",
    "Working independently on a complex research question",
    "Spotting patterns or inconsistencies that others miss in data",
  ],
  A: [
    "Creating original designs, writing, music, or visual art",
    "Coming up with unconventional ideas with no fixed right answer",
    "Expressing a concept through storytelling, design, or performance",
    "Working in an unstructured environment where you set your own approach",
    "Redesigning something to make it more original or aesthetically better",
    "Improvising or adapting an idea on the spot",
  ],
  S: [
    "Teaching, coaching, or mentoring someone through a challenge",
    "Listening to people's problems and helping them find a solution",
    "Organizing or facilitating a group activity or discussion",
    "Working directly with people who need support or guidance",
    "Resolving a conflict or disagreement between people",
    "Building trust and rapport with someone you've just met",
  ],
  E: [
    "Persuading a group to support an idea or plan you believe in",
    "Starting or pitching a new project, product, or venture",
    "Negotiating a deal or outcome that benefits your side",
    "Leading a team toward an ambitious goal or deadline",
    "Taking a calculated risk to pursue a bigger opportunity",
    "Competing to win against other individuals or teams",
  ],
  C: [
    "Organizing files, records, schedules, or data with precision",
    "Following clear rules, procedures, or checklists to avoid errors",
    "Tracking budgets, numbers, or inventory carefully",
    "Reviewing detailed work for accuracy and consistency",
    "Setting up and maintaining an efficient, orderly system",
    "Completing well-defined tasks within a structured process",
  ],
};

export const RIASEC_ITEMS: RiasecItem[] = DIMENSIONS.flatMap((dimension) =>
  ITEM_TEXT[dimension].map((text, i) => ({
    id: `${dimension}${i + 1}`,
    dimension,
    text,
  }))
);

export type RiasecAnswer = { itemId: string; score: number }; // score 1-5

export function scoreRiasec(answers: RiasecAnswer[]) {
  const byId = new Map(RIASEC_ITEMS.map((item) => [item.id, item]));
  const totals: Record<RiasecDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts: Record<RiasecDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const answer of answers) {
    const item = byId.get(answer.itemId);
    if (!item) continue;
    totals[item.dimension] += answer.score;
    counts[item.dimension] += 1;
  }

  const scores: Record<RiasecDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const dimension of DIMENSIONS) {
    const max = counts[dimension] * 5;
    const min = counts[dimension] * 1;
    scores[dimension] =
      max > min ? Math.round(((totals[dimension] - min) / (max - min)) * 100) : 0;
  }

  const code = [...DIMENSIONS]
    .sort((a, b) => scores[b] - scores[a] || DIMENSIONS.indexOf(a) - DIMENSIONS.indexOf(b))
    .slice(0, 3)
    .join("");

  return { scores, code };
}
