// Completeness meter: per-section richness + overall %.
import { ParsedResume, CompletenessItem } from "./types";

// Score a section 0-100 based on presence and richness.
function scoreSection(parsed: ParsedResume, idList: string[], minWords: number): number {
  const sec = parsed.sections.find((s) => idList.includes(s.id) && s.present);
  if (!sec) return 0;
  if (sec.wordCount === 0) return 20;
  if (sec.wordCount >= minWords) return 100;
  return Math.round(40 + (sec.wordCount / minWords) * 60);
}

export function analyzeCompleteness(parsed: ParsedResume) {
  const items: CompletenessItem[] = [
    { section: "Contact", percent: scoreContact(parsed) },
    { section: "Summary", percent: scoreSection(parsed, ["summary", "objective"], 30) },
    { section: "Education", percent: scoreSection(parsed, ["education"], 20) },
    { section: "Experience", percent: scoreSection(parsed, ["experience", "internships"], 40) },
    { section: "Projects", percent: scoreSection(parsed, ["projects"], 40) },
    { section: "Skills", percent: scoreSection(parsed, ["skills", "technicalSkills"], 12) },
    { section: "Achievements", percent: scoreSection(parsed, ["achievements"], 15) },
    { section: "Certifications", percent: scoreSection(parsed, ["certifications"], 12) },
  ];

  const overall = Math.round(
    items.reduce((sum, it) => sum + it.percent, 0) / items.length,
  );

  return { overall, items };
}

function scoreContact(parsed: ParsedResume): number {
  const c = parsed.contact;
  let score = 0;
  if (c.name) score += 25;
  if (c.email) score += 25;
  if (c.phone) score += 20;
  if (c.linkedin) score += 15;
  if (c.github) score += 15;
  return Math.min(100, score);
}
