import type { MarketValue } from "@/lib/constants";

export type CourseLink = {
  platform: string;
  title: string;
  url: string;
};

/**
 * We don't have catalog API access to these platforms, so instead of guessing at
 * course IDs we build real, filtered search-result deep links per skill. This is
 * the "matching layer" described in the product spec (no in-house catalog yet).
 */
export function courseLinksForSkill(skill: string, market: MarketValue): CourseLink[] {
  const q = encodeURIComponent(skill);
  const links: CourseLink[] = [
    {
      platform: "Coursera",
      title: `"${skill}" courses on Coursera`,
      url: `https://www.coursera.org/search?query=${q}`,
    },
    {
      platform: "edX",
      title: `"${skill}" courses on edX`,
      url: `https://www.edx.org/search?q=${q}`,
    },
    {
      platform: "LinkedIn Learning",
      title: `"${skill}" courses on LinkedIn Learning`,
      url: `https://www.linkedin.com/learning/search?keywords=${q}`,
    },
  ];

  if (market === "SINGAPORE") {
    links.push({
      platform: "SkillsFuture",
      title: `"${skill}" courses on SkillsFuture (SG)`,
      url: `https://www.myskillsfuture.gov.sg/content/portal/en/training-exchange/course-directory.html?searchString=${q}`,
    });
  }

  if (market === "MALAYSIA") {
    links.push({
      platform: "HRDF / HRD Corp",
      title: `"${skill}" search on HRD Corp claimable courses (MY)`,
      url: `https://www.hrdcorp.gov.my/?s=${q}`,
    });
  }

  return links;
}
