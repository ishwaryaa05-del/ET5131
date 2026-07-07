import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { MARKET_LABELS, ROLE_LEVEL_LABELS, type MarketValue, type RoleLevelValue } from "@/lib/constants";

const MODEL = "claude-sonnet-5";

export class AIUnavailableError extends Error {
  constructor() {
    super(
      "AI features require an ANTHROPIC_API_KEY. Add one to your .env file (see .env.example) and restart the server."
    );
    this.name = "AIUnavailableError";
  }
}

let client: Anthropic | null | undefined;

function getClient(): Anthropic | null {
  if (client !== undefined) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  client = apiKey ? new Anthropic({ apiKey }) : null;
  return client;
}

export function isAIEnabled() {
  return getClient() !== null;
}

/** Sends a prompt and parses a strict-JSON reply against a zod schema. */
export async function askForJSON<T>(opts: {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
}): Promise<T> {
  const anthropic = getClient();
  if (!anthropic) throw new AIUnavailableError();

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 3000,
    system: `${opts.system}\n\nRespond with ONLY a single valid JSON value matching the requested shape. No markdown fences, no commentary before or after.`,
    messages: [{ role: "user", content: opts.prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch {
    throw new Error("The AI response could not be parsed. Please try again.");
  }

  const result = opts.schema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error("The AI response did not match the expected format. Please try again.");
  }
  return result.data;
}

function marketContext(market: MarketValue, industry: string) {
  return `Target market: ${MARKET_LABELS[market]}. Target industry: ${industry}.`;
}

// ---------- Feature 2: JD auto-tagging ----------

const jdTagSchema = z.object({
  title: z.string(),
  industry: z.string(),
  roleLevel: z.enum(["INTERNSHIP", "ENTRY_LEVEL", "ASSOCIATE"]),
});
export type JdTagResult = z.infer<typeof jdTagSchema>;

export async function tagJobDescription(jdText: string): Promise<JdTagResult> {
  return askForJSON({
    system:
      "You tag job descriptions for a career-prep platform serving ASEAN students. Infer the job title, a short industry label (2-4 words, e.g. 'Banking & Finance', 'Technology / Software'), and the seniority level.",
    prompt: `Job description:\n"""\n${jdText}\n"""\n\nReturn JSON: { "title": string, "industry": string, "roleLevel": "INTERNSHIP" | "ENTRY_LEVEL" | "ASSOCIATE" }`,
    schema: jdTagSchema,
    maxTokens: 500,
  });
}

// ---------- Feature 3: Interview question generator ----------

const questionSetSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        strongAnswerNote: z.string(),
      })
    )
    .min(5)
    .max(8),
});
export type QuestionSetResult = z.infer<typeof questionSetSchema>;

export async function generateInterviewQuestions(opts: {
  jdText: string;
  market: MarketValue;
  industry: string;
  roleLevel: RoleLevelValue;
}): Promise<QuestionSetResult> {
  return askForJSON({
    system: `You are an interview coach specializing in ${MARKET_LABELS[opts.market]} hiring norms. You write realistic interview questions and market-specific guidance on what makes an answer strong there (e.g. metrics-led answers for Singapore finance roles vs. storytelling/relationship framing for Myanmar creative roles). Be concrete and specific to the market, not generic.`,
    prompt: `${marketContext(opts.market, opts.industry)}\nRole level: ${ROLE_LEVEL_LABELS[opts.roleLevel]}.\n\nJob description:\n"""\n${opts.jdText}\n"""\n\nGenerate 5 to 8 interview questions this candidate is likely to be asked. For each, write a 2-4 sentence "strongAnswerNote" describing what a strong answer looks like specifically for this market and industry (structure, tone, what employers weigh).\n\nReturn JSON: { "questions": [ { "question": string, "strongAnswerNote": string } ] }`,
    schema: questionSetSchema,
    maxTokens: 3000,
  });
}

// ---------- Feature 4: Dual-Tongue CQ Interview Simulator ----------

const dualTongueFeedbackSchema = z.object({
  contentScore: z.number().min(0).max(10),
  deliveryScore: z.number().min(0).max(10),
  culturalFitScore: z.number().min(0).max(10),
  summary: z.string(),
  nativeLanguageFeedback: z.string(),
  modelEnglishAnswer: z.string(),
  dualTongueNotes: z.array(
    z.object({
      original: z.string(),
      issue: z.string(),
      suggestedEnglish: z.string(),
    })
  ),
});
export type DualTongueFeedback = z.infer<typeof dualTongueFeedbackSchema>;

export async function getDualTongueFeedback(opts: {
  question: string;
  strongAnswerNote: string;
  answerText: string;
  answerLanguage: string;
  market: MarketValue;
  industry: string;
}): Promise<DualTongueFeedback> {
  return askForJSON({
    system: `You are a bilingual interview coach for candidates in ${MARKET_LABELS[opts.market]} who practice partly or fully in their native language (Burmese, Malay, Tamil) or a mix with English. Your specialty ("Dual-Tongue" coaching) is spotting phrases, idioms, or framing native to their language that carry a strong trait (e.g. initiative, humility, leadership) but would not land the same way if translated literally into corporate English — and coaching the precise English rephrasing that preserves the trait. Never just translate; always explain what the phrase signals and how to say that in a way an English-speaking interviewer in this market would recognize as strong. Many of your students have weak English fluency, so your own feedback must be understandable to them, not just correct.`,
    prompt: `${marketContext(opts.market, opts.industry)}\nInterview question: "${opts.question}"\nWhat a strong answer looks like here: ${opts.strongAnswerNote}\n\nCandidate answered in: ${opts.answerLanguage}\nCandidate's answer:\n"""\n${opts.answerText}\n"""\n\nEvaluate on three dimensions (0-10 each):\n- contentScore: did they actually answer the question with substance?\n- deliveryScore: clarity, structure, filler words, conciseness.\n- culturalFitScore: does the framing read as strong to an interviewer in this specific market (regardless of language used)?\n\nAlso identify 0-4 specific "dualTongueNotes": phrases in the candidate's own words (their original language or a direct/awkward translation they used) where an idiom or trait native to their language wouldn't land the same in English, each with the issue explained and the precise English rephrasing that conveys the same trait. If the answer is already strong, natural English, return an empty array for dualTongueNotes.\n\nWrite a 2-3 sentence overall "summary" of the feedback in English.\n\nAlso write "nativeLanguageFeedback": the same core content/delivery feedback (what was strong, what to improve), but written in ${opts.answerLanguage} if that is not English, so a candidate with weak English fluency can fully understand the coaching. If the candidate answered in English, set this to an empty string.\n\nAlso write "modelEnglishAnswer": a polished, natural-sounding English version of what the candidate was trying to say — same substance and ideas, but expressed the way a strong candidate would say it in English in this market. This becomes practice material for the candidate, so make it something a non-fluent speaker could realistically read aloud and learn from (clear sentences, not overly complex vocabulary).\n\nReturn JSON: { "contentScore": number, "deliveryScore": number, "culturalFitScore": number, "summary": string, "nativeLanguageFeedback": string, "modelEnglishAnswer": string, "dualTongueNotes": [ { "original": string, "issue": string, "suggestedEnglish": string } ] }`,
    schema: dualTongueFeedbackSchema,
    maxTokens: 2000,
  });
}

// ---------- Feature 4b: English-practice round (text-based fluency coaching) ----------

const englishPracticeFeedbackSchema = z.object({
  fluencyScore: z.number().min(0).max(10),
  summary: z.string(),
  corrections: z.array(
    z.object({
      original: z.string(),
      suggestion: z.string(),
      reason: z.string(),
    })
  ),
  possibleMispronunciations: z.array(
    z.object({
      word: z.string(),
      note: z.string(),
    })
  ),
});
export type EnglishPracticeFeedback = z.infer<typeof englishPracticeFeedbackSchema>;

export async function getEnglishPracticeFeedback(opts: {
  modelAnswer: string;
  attemptText: string;
}): Promise<EnglishPracticeFeedback> {
  return askForJSON({
    system:
      "You are an ESL (English as a Second Language) speaking coach. A student was given a model English answer to read aloud from memory, and you're given a speech-to-text transcript of their attempt. You give text-based coaching only: grammar, word choice, and natural phrasing. You do NOT have access to audio, so you cannot precisely score pronunciation — but a speech-to-text engine tends to mis-transcribe words that are pronounced very differently from the target word (wrong stress, wrong vowel sounds, dropped syllables), so a word in the transcript that doesn't match the model answer and isn't just a paraphrase can be a weak, indirect signal of a pronunciation issue worth a gentle, clearly-hedged note — never state this as a certain diagnosis.",
    prompt: `Model English answer the student was practicing:\n"""\n${opts.modelAnswer}\n"""\n\nSpeech-to-text transcript of the student's spoken attempt:\n"""\n${opts.attemptText}\n"""\n\nGive:\n- fluencyScore (0-10): how close their attempt is to fluent, natural spoken English, considering this is a practice reading of a model answer.\n- summary: 2-3 encouraging sentences on overall performance.\n- corrections: 0-5 items, each quoting a phrase from their attempt ("original"), a corrected/more natural version ("suggestion"), and a one-sentence "reason" (grammar, word choice, or phrasing).\n- possibleMispronunciations: 0-4 items for words in the transcript that diverge oddly from the model answer in a way that might indicate a mispronunciation rather than a wording choice. Each has the "word" as it appears in their transcript and a hedged "note" (e.g. "This may just be a transcription quirk, but if the speech-to-text heard '...' instead of '...', check you're stressing the second syllable"). Leave this empty if nothing stands out — do not force findings.\n\nReturn JSON: { "fluencyScore": number, "summary": string, "corrections": [ { "original": string, "suggestion": string, "reason": string } ], "possibleMispronunciations": [ { "word": string, "note": string } ] }`,
    schema: englishPracticeFeedbackSchema,
    maxTokens: 1200,
  });
}

// ---------- Feature 5: Resume tailoring ----------

const resumeTailoringSchema = z.object({
  formatSuggestions: z.array(z.string()),
  contentSuggestions: z.array(
    z.object({
      original: z.string(),
      suggestion: z.string(),
      reason: z.string(),
    })
  ),
});
export type ResumeTailoringResult = z.infer<typeof resumeTailoringSchema>;

export async function tailorResume(opts: {
  resumeText: string;
  jdText: string;
  market: MarketValue;
  industry: string;
}): Promise<ResumeTailoringResult> {
  return askForJSON({
    system: `You are a resume coach who knows hiring norms specific to ${MARKET_LABELS[opts.market]} (photo conventions, resume length, date formats, tone) as opposed to generic Western resume advice.`,
    prompt: `${marketContext(opts.market, opts.industry)}\n\nTarget job description:\n"""\n${opts.jdText}\n"""\n\nCandidate resume:\n"""\n${opts.resumeText}\n"""\n\nGive:\n1. formatSuggestions: 3-6 short, specific format fixes calibrated to ${MARKET_LABELS[opts.market]} norms (e.g. photo, length, date format, section order).\n2. contentSuggestions: 3-8 items, each quoting a weak bullet/line verbatim from the resume ("original"), a rewritten version ("suggestion") that better matches the JD and adds quantification where missing, and a one-sentence "reason".\n\nReturn JSON: { "formatSuggestions": string[], "contentSuggestions": [ { "original": string, "suggestion": string, "reason": string } ] }`,
    schema: resumeTailoringSchema,
    maxTokens: 2500,
  });
}

// ---------- Feature 6: RIASEC cultural interpretation ----------

const riasecInterpretationSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  watchOuts: z.array(z.string()),
  marketNotes: z.array(z.string()),
});
export type RiasecInterpretation = z.infer<typeof riasecInterpretationSchema>;

export async function interpretRiasecCode(opts: {
  code: string;
  scores: Record<string, number>;
  market: MarketValue;
  industry: string;
}): Promise<RiasecInterpretation> {
  return askForJSON({
    system: `You interpret Holland Code (RIASEC) results for students in ${MARKET_LABELS[opts.market]}, explaining how each trait combination is specifically valued (or perceived) in local workplace culture there, as opposed to generic Western career-advice framing.`,
    prompt: `Holland Code: ${opts.code}\nRaw scores (0-100 scale per dimension, R=Realistic, I=Investigative, A=Artistic, S=Social, E=Enterprising, C=Conventional): ${JSON.stringify(opts.scores)}\n${marketContext(opts.market, opts.industry)}\n\nWrite:\n- summary: 2-3 sentences on what this code combination generally means.\n- strengths: 3-5 bullet strengths this profile brings to the target industry.\n- watchOuts: 2-4 bullet blind spots or friction points to watch for.\n- marketNotes: 2-4 bullets specifically on how this profile is perceived/valued in ${MARKET_LABELS[opts.market]} workplace culture for ${opts.industry} (be concrete, not generic).\n\nReturn JSON: { "summary": string, "strengths": string[], "watchOuts": string[], "marketNotes": string[] }`,
    schema: riasecInterpretationSchema,
    maxTokens: 1200,
  });
}

// ---------- Feature 7: Skill-gap detection ----------

const skillGapSchema = z.object({
  gaps: z
    .array(
      z.object({
        skill: z.string(),
        why: z.string(),
      })
    )
    .max(10),
});
export type SkillGapResult = z.infer<typeof skillGapSchema>;

export async function detectSkillGaps(opts: {
  resumeText: string;
  jdText: string;
}): Promise<SkillGapResult> {
  return askForJSON({
    system:
      "You compare a resume against a target job description and identify specific, concrete missing skills — never vague categories. E.g. 'SQL joins and window functions', not 'technical skills'; 'Facebook Ads Manager campaign setup', not 'marketing skills'.",
    prompt: `Job description:\n"""\n${opts.jdText}\n"""\n\nResume:\n"""\n${opts.resumeText}\n"""\n\nList up to 10 specific skills/tools/techniques the JD implies are needed that are missing or weak in the resume. For each, give a one-sentence "why" explaining why the JD requires it.\n\nReturn JSON: { "gaps": [ { "skill": string, "why": string } ] }`,
    schema: skillGapSchema,
    maxTokens: 1200,
  });
}
