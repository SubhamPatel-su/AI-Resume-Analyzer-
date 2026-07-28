// ATS scoring engine: 6 categories (Formatting, Sections, Keywords, Action
// Verbs, Readability, Grammar) each scored out of 20 → overall 0-100.
import {
  ParsedResume,
  ATSResult,
  ScoreBreakdownItem,
  ATSPenalty,
  WeakSentence,
  ReadabilityResult,
  GrammarIssue,
  FormattingIssue,
  KeywordResult,
} from "./types";
import { gradeFor } from "./classify";

export interface ATSInputs {
  parsed: ParsedResume;
  weakSentences: WeakSentence[];
  actionVerbsUsed: string[];
  keywords: KeywordResult;
  readability: ReadabilityResult;
  grammar: GrammarIssue[];
  formatting: FormattingIssue[];
  sourceType: "pdf" | "image" | "text";
  metricsMissingCount: number;
}

function clamp(n: number, lo = 0, hi = 20) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export function scoreATS(input: ATSInputs): ATSResult {
  const penalties: ATSPenalty[] = [];
  const { parsed } = input;

  // ---- 1. Sections (20) ----
  const required = [
    { id: "contact", label: "Contact" },
    { id: "summary", label: "Summary/Objective", alt: "objective" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience", alt: "internships" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills", alt: "technicalSkills" },
  ];
  let sectionsPresent = 0;
  for (const r of required) {
    const ids = r.alt ? [r.id, r.alt] : [r.id];
    const found = parsed.sections.some((s) => ids.includes(s.id) && s.present);
    if (found) sectionsPresent++;
    else penalties.push({ rule: `Missing ${r.label}`, points: 0, reason: `${r.label} section not detected.` });
  }
  const bonusSections = ["achievements", "certifications", "languages"];
  const bonusPresent = parsed.sections.filter((s) => bonusSections.includes(s.id) && s.present).length;
  let sectionsScore = (sectionsPresent / required.length) * 16 + (bonusPresent / bonusSections.length) * 4;
  if (sectionsPresent < required.length) {
    penalties.push({
      rule: "Missing core sections",
      points: 4,
      reason: `${required.length - sectionsPresent} core section(s) missing.`,
    });
  }

  // ---- 2. Keywords (20) ----
  const matchedCount = input.keywords.matched.length;
  const totalCatalog = input.keywords.totalScanned;
  // full marks at >=18 distinct ATS keywords (reasonable for a strong resume)
  let keywordsScore = Math.min(20, (matchedCount / 18) * 20);
  if (matchedCount < 8) {
    penalties.push({
      rule: "Low ATS keyword coverage",
      points: 4,
      reason: `Only ${matchedCount} ATS keywords matched out of ${totalCatalog} scanned.`,
    });
  }

  // ---- 3. Action Verbs (20) ----
  const verbsCount = input.actionVerbsUsed.length;
  const weakCount = input.weakSentences.length;
  let verbsScore = Math.min(16, (verbsCount / 12) * 16);
  verbsScore += weakCount === 0 ? 4 : Math.max(0, 4 - weakCount);
  if (weakCount > 0) {
    penalties.push({
      rule: "Weak / passive phrasing",
      points: Math.min(6, weakCount),
      reason: `${weakCount} weak or passive sentence(s) detected.`,
    });
  }
  if (verbsCount < 5) {
    penalties.push({
      rule: "Few strong action verbs",
      points: 3,
      reason: `Only ${verbsCount} strong action verbs found.`,
    });
  }

  // ---- 4. Readability (20) ----
  const f = input.readability.fleschScore;
  let readabilityScore = (f / 100) * 16;
  // penalize high passive %
  readabilityScore -= Math.min(6, input.readability.passiveVoicePct / 10);
  readabilityScore += f >= 50 ? 4 : 0;
  if (f < 40) {
    penalties.push({
      rule: "Low readability",
      points: 3,
      reason: `Flesch score ${f}/100 — sentences are hard to scan.`,
    });
  }

  // ---- 5. Grammar (20) ----
  const grammarCount = input.grammar.length;
  let grammarScore = 20 - grammarCount * 2.5;
  if (grammarCount > 0) {
    penalties.push({
      rule: "Grammar / style issues",
      points: Math.min(8, grammarCount * 2),
      reason: `${grammarCount} grammar/style issue(s) found.`,
    });
  }

  // ---- 6. Formatting (20) ----
  let formattingScore = 20;
  for (const fi of input.formatting) {
    if (fi.severity === "danger") formattingScore -= 5;
    else if (fi.severity === "warning") formattingScore -= 3;
    else formattingScore -= 1;
  }
  if (input.sourceType === "image") formattingScore -= 2;
  if (input.formatting.some((f) => f.type === "Tables")) {
    penalties.push({ rule: "Tables detected", points: 4, reason: "Tables can break ATS parsing." });
  }

  // ---- measurable results bonus/penalty ----
  if (input.metricsMissingCount >= 5) {
    penalties.push({
      rule: "No measurable results",
      points: 4,
      reason: `${input.metricsMissingCount} achievement sentences lack numbers/metrics.`,
    });
    verbsScore -= 2;
  }

  // ---- Contact penalties ----
  if (!parsed.contact.email) penalties.push({ rule: "Missing email", points: 5, reason: "No email address detected." });
  if (!parsed.contact.phone) penalties.push({ rule: "Missing phone", points: 4, reason: "No phone number detected." });
  if (!parsed.contact.github) penalties.push({ rule: "No GitHub", points: 3, reason: "No GitHub profile link found." });
  if (!parsed.contact.linkedin) penalties.push({ rule: "No LinkedIn", points: 3, reason: "No LinkedIn profile link found." });

  const breakdown: ScoreBreakdownItem[] = [
    { key: "formatting", label: "Formatting", score: clamp(formattingScore), max: 20, note: noteForFormatting(input.formatting) },
    { key: "sections", label: "Sections", score: clamp(sectionsScore), max: 20, note: `${sectionsPresent}/${required.length} core sections present` },
    { key: "keywords", label: "Keywords", score: clamp(keywordsScore), max: 20, note: `${matchedCount} ATS keywords matched` },
    { key: "verbs", label: "Action Verbs", score: clamp(verbsScore), max: 20, note: `${verbsCount} strong verbs · ${weakCount} weak sentences` },
    { key: "readability", label: "Readability", score: clamp(readabilityScore), max: 20, note: `Flesch ${f}/100` },
    { key: "grammar", label: "Grammar", score: clamp(grammarScore), max: 20, note: `${grammarCount} issue(s)` },
  ];

  const overall = clamp(breakdown.reduce((s, b) => s + b.score, 0), 0, 100);
  const { grade, label } = gradeFor(overall);

  return {
    overall,
    grade,
    gradeLabel: label,
    breakdown,
    penalties: penalties.sort((a, b) => b.points - a.points),
  };
}

function noteForFormatting(issues: FormattingIssue[]): string {
  if (issues.length === 0) return "Clean, ATS-friendly text";
  return `${issues.length} formatting issue(s)`;
}
