export const MARKET_VALUES = ["SINGAPORE", "MALAYSIA", "MYANMAR"] as const;
export type MarketValue = (typeof MARKET_VALUES)[number];

export const MARKET_LABELS: Record<MarketValue, string> = {
  SINGAPORE: "Singapore",
  MALAYSIA: "Malaysia",
  MYANMAR: "Myanmar",
};

export const LANGUAGE_VALUES = ["ENGLISH", "BURMESE", "MALAY", "TAMIL", "MIXED"] as const;
export type LanguageValue = (typeof LANGUAGE_VALUES)[number];

export const LANGUAGE_LABELS: Record<LanguageValue, string> = {
  ENGLISH: "English",
  BURMESE: "Burmese",
  MALAY: "Malay",
  TAMIL: "Tamil",
  MIXED: "Mixed / code-switching",
};

/** BCP-47 locale used for browser speech recognition when answering in each language. */
export const SPEECH_RECOGNITION_LOCALES: Record<LanguageValue, string> = {
  ENGLISH: "en-US",
  BURMESE: "my-MM",
  MALAY: "ms-MY",
  TAMIL: "ta-IN",
  // Code-switching answers don't map to a single ASR locale; English tends to
  // pick up the most cognates in mixed speech among widely supported locales.
  MIXED: "en-US",
};

export const ROLE_LEVEL_VALUES = ["INTERNSHIP", "ENTRY_LEVEL", "ASSOCIATE"] as const;
export type RoleLevelValue = (typeof ROLE_LEVEL_VALUES)[number];

export const ROLE_LEVEL_LABELS: Record<RoleLevelValue, string> = {
  INTERNSHIP: "Internship",
  ENTRY_LEVEL: "Entry-level",
  ASSOCIATE: "Associate",
};

export const INDUSTRY_SUGGESTIONS = [
  "Banking & Finance",
  "Technology / Software",
  "Consulting",
  "Marketing & Creative",
  "Manufacturing & Engineering",
  "Healthcare",
  "Education",
  "Retail & E-commerce",
  "Logistics & Supply Chain",
  "Public Sector",
];
