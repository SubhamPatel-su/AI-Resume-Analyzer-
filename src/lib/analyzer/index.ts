// Orchestrator: runs the full offline analysis pipeline on extracted text.
import { AnalysisResult } from "./types";
import { parseResume, getSectionText } from "./parser";
import { detectWeakSentences, findActionVerbsUsed, recommendActionVerbs, countSentencesWithoutMetrics } from "./weak-sentences";
import { analyzeKeywords, extractTopKeywords } from "./keywords";
import { analyzeSkills } from "./skills";
import { analyzeProjects } from "./projects";
import { checkGrammar } from "./grammar";
import { analyzeReadability } from "./readability";
import { analyzeFormatting } from "./formatting";
import { analyzeCompleteness } from "./completeness";
import { classifyResume, analyzeLength } from "./classify";
import { scoreATS } from "./ats-scorer";
import { buildSuggestions } from "./suggestions";

export interface AnalyzeOptions {
  fileName?: string;
  sourceType?: "pdf" | "image" | "text";
}

export function analyzeResume(rawText: string, options: AnalyzeOptions = {}): AnalysisResult {
  const fileName = options.fileName ?? "resume.txt";
  const sourceType = options.sourceType ?? "text";

  // 1. Parse
  const parsed = parseResume(rawText);

  // 2. Analysis modules (independent)
  const skillsText = getSectionText(parsed, "skills", "technicalSkills");
  const fullText = parsed.cleanedText;
  // Combine experience + internships + projects for writing analysis, since
  // achievement bullets appear in both.
  const experienceText = ["experience", "internships", "projects"]
    .map((id) => getSectionText(parsed, id as never))
    .filter(Boolean)
    .join("\n\n") || fullText;

  const weakSentences = detectWeakSentences(experienceText);
  const actionVerbsUsed = findActionVerbsUsed(experienceText);
  const recommended = recommendActionVerbs(actionVerbsUsed, fullText);
  const keywords = analyzeKeywords(fullText);
  const skills = analyzeSkills(skillsText || fullText);
  const projects = analyzeProjects(parsed);
  const grammar = checkGrammar(fullText);
  const readability = analyzeReadability(fullText);
  const formatting = analyzeFormatting(parsed.rawText, sourceType);
  const completeness = analyzeCompleteness(parsed);
  const classification = classifyResume(parsed);
  const length = analyzeLength(parsed);
  const metricsMissingCount = countSentencesWithoutMetrics(experienceText);
  const topKeywords = extractTopKeywords(fullText, 15);

  // 3. ATS scoring
  const ats = scoreATS({
    parsed,
    weakSentences,
    actionVerbsUsed,
    keywords,
    readability,
    grammar,
    formatting,
    sourceType,
    metricsMissingCount,
  });

  // 4. Suggestions + checklist
  const partial: Omit<AnalysisResult, "suggestions" | "checklist"> = {
    parsed,
    ats,
    classification,
    weakSentences,
    actionVerbs: { used: actionVerbsUsed, recommended },
    keywords,
    grammar,
    readability,
    formatting,
    projects,
    skills,
    completeness,
    length,
    metricsMissingCount,
    topKeywords,
    createdAt: Date.now(),
    fileName,
    sourceType,
  };
  const { suggestions, checklist } = buildSuggestions(partial);

  return { ...partial, suggestions, checklist };
}
