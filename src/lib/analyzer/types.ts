// Shared types for the offline resume analysis engine.

export type SectionId =
  | "summary"
  | "objective"
  | "education"
  | "experience"
  | "internships"
  | "projects"
  | "skills"
  | "technicalSkills"
  | "softSkills"
  | "achievements"
  | "certifications"
  | "languages"
  | "publications"
  | "volunteer"
  | "references"
  | "contact";

export interface SectionInfo {
  id: SectionId;
  label: string;
  present: boolean;
  text: string;
  lineCount: number;
  wordCount: number;
}

export interface ContactInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  location: string | null;
}

export interface ParsedResume {
  rawText: string;
  cleanedText: string;
  contact: ContactInfo;
  sections: SectionInfo[];
  wordCount: number;
  lineCount: number;
  pageCount: number;
  charCount: number;
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  score: number;
  max: number;
  note: string;
}

export type ResumeGrade = "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

export interface ATSPenalty {
  rule: string;
  points: number;
  reason: string;
}

export interface ATSResult {
  overall: number;
  grade: ResumeGrade;
  gradeLabel: string;
  breakdown: ScoreBreakdownItem[];
  penalties: ATSPenalty[];
}

export interface WeakSentence {
  sentence: string;
  type: "weak" | "passive" | "generic" | "vague";
  issue: string;
  suggestion: string;
  improved: string;
}

export interface KeywordMatch {
  keyword: string;
  category: string;
}

export interface KeywordResult {
  matched: KeywordMatch[];
  missing: KeywordMatch[];
  totalScanned: number;
}

export interface ProjectQuality {
  title: string;
  rawText: string;
  hasDescription: boolean;
  hasTechnologies: boolean;
  hasMetrics: boolean;
  wordCount: number;
  quality: "strong" | "average" | "weak";
  issues: string[];
  suggestion: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface SkillsAnalysis {
  categories: SkillCategory[];
  total: number;
  uncategorized: string[];
}

export interface GrammarIssue {
  type: string;
  message: string;
  excerpt: string;
  fix: string;
}

export interface ReadabilityResult {
  fleschScore: number;
  gradeLevel: number;
  avgSentenceLength: number;
  complexWordPct: number;
  passiveVoicePct: number;
  label: string;
}

export interface FormattingIssue {
  type: string;
  severity: "info" | "warning" | "danger";
  message: string;
}

export interface CompletenessItem {
  section: string;
  percent: number;
}

export type SuggestionCategory =
  | "critical"
  | "improvement"
  | "tip"
  | "positive";

export interface Suggestion {
  id: string;
  category: SuggestionCategory;
  title: string;
  detail: string;
  section?: string;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface ResumeClassification {
  type: "student" | "internship" | "professional" | "academic";
  label: string;
  confidence: number;
}

export interface ResumeLength {
  status: "too_short" | "ideal" | "too_long";
  pages: number;
  words: number;
  recommendation: string;
}

export interface AnalysisResult {
  parsed: ParsedResume;
  ats: ATSResult;
  classification: ResumeClassification;
  weakSentences: WeakSentence[];
  actionVerbs: { used: string[]; recommended: string[] };
  keywords: KeywordResult;
  grammar: GrammarIssue[];
  readability: ReadabilityResult;
  formatting: FormattingIssue[];
  projects: ProjectQuality[];
  skills: SkillsAnalysis;
  completeness: { overall: number; items: CompletenessItem[] };
  suggestions: Suggestion[];
  checklist: ChecklistItem[];
  length: ResumeLength;
  metricsMissingCount: number;
  topKeywords: { term: string; count: number }[];
  createdAt: number;
  fileName: string;
  sourceType: "pdf" | "image" | "text";
}
