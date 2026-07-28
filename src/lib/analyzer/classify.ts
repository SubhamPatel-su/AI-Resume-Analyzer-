// Resume classification + length analysis + grade mapping.
import { ParsedResume, ResumeClassification, ResumeLength, ResumeGrade } from "./types";

export function classifyResume(parsed: ParsedResume): ResumeClassification {
  const text = parsed.cleanedText.toLowerCase();

  const academicSignals = [
    "research", "publication", "paper", "thesis", "phd", "ph.d", "postdoc",
    "citations", "journal", "conference", "scholar",
  ].filter((s) => text.includes(s)).length;

  const studentSignals = [
    "cgpa", "gpa", "university", "college", "b.tech", "b.e", "b.sc", "m.tech",
    "pursuing", "final year", "school", "10th", "12th", "intermediate", "semester",
  ].filter((s) => text.includes(s)).length;

  const internshipSignals = [
    "intern", "internship", "trainee", "summer intern", "stipend",
  ].filter((s) => text.includes(s)).length;

  const professionalSignals = [
    "years of experience", "yoe", "senior", "lead", "manager", "managed",
    "promotion", "salary", "notice period", "current company", "employed at",
  ].filter((s) => text.includes(s)).length;

  // also use experience section length
  const expSection = parsed.sections.find((s) => s.id === "experience");
  const expWords = expSection?.present ? expSection.wordCount : 0;
  const profBoost = expWords > 120 ? 2 : expWords > 60 ? 1 : 0;

  const scores = [
    { type: "student" as const, label: "Student Resume", score: studentSignals },
    { type: "internship" as const, label: "Internship Resume", score: internshipSignals + (studentSignals > 0 ? 1 : 0) },
    { type: "professional" as const, label: "Professional Resume", score: professionalSignals + profBoost },
    { type: "academic" as const, label: "Academic CV", score: academicSignals },
  ];

  scores.sort((a, b) => b.score - a.score);
  const total = scores.reduce((s, x) => s + x.score, 0) || 1;
  const confidence = Math.round((scores[0].score / total) * 100);

  return {
    type: scores[0].type,
    label: scores[0].label,
    confidence: Math.max(34, Math.min(98, confidence)),
  };
}

export function analyzeLength(parsed: ParsedResume): ResumeLength {
  const { pageCount, wordCount } = parsed;
  let status: ResumeLength["status"];
  let recommendation: string;

  if (wordCount < 250) {
    status = "too_short";
    recommendation =
      "Resume is quite short. Add projects, coursework, and achievements to fill at least one page.";
  } else if (pageCount <= 1 && wordCount <= 600) {
    status = "ideal";
    recommendation =
      "Length is ideal for a fresher/student (1 page). Keep it tight and impact-focused.";
  } else if (pageCount === 2 && wordCount <= 1200) {
    status = "ideal";
    recommendation =
      "2-page length suits an experienced professional. Ensure every line adds value.";
  } else if (pageCount > 2) {
    status = "too_long";
    recommendation =
      "Resume exceeds 2 pages. Trim older roles and irrelevant details — recruiters spend ~6 seconds on the first scan.";
  } else {
    status = "too_long";
    recommendation =
      "Resume is dense. Tighten wording and remove filler to keep it scannable.";
  }

  return { status, pages: pageCount, words: wordCount, recommendation };
}

export function gradeFor(score: number): { grade: ResumeGrade; label: string } {
  if (score >= 92) return { grade: "A+", label: "Excellent" };
  if (score >= 85) return { grade: "A", label: "Very Good" };
  if (score >= 78) return { grade: "B+", label: "Good" };
  if (score >= 68) return { grade: "B", label: "Average" };
  if (score >= 55) return { grade: "C", label: "Needs Improvement" };
  if (score >= 40) return { grade: "D", label: "Below Average" };
  return { grade: "F", label: "Poor" };
}
