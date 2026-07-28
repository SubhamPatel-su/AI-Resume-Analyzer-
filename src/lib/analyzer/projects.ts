// Project quality checker: evaluates each detected project entry.
import { ProjectQuality } from "./types";
import { getSectionText } from "./parser";
import { ParsedResume } from "./types";

const TECH_RE =
  /\b(java|python|javascript|typescript|react|node\.?js|spring|django|flask|mysql|mongodb|postgresql|aws|docker|kubernetes|tensorflow|pytorch|html|css|c\+\+|c#|kotlin|swift|flutter|android|ios|git|sql|nosql|redis|firebase|graphql|rest|api|express|vue|angular|next\.?js|tailwind|bootstrap)\b/gi;

const METRIC_RE =
  /(\b\d{1,3}\s?%|\$\s?\d|\b\d{2,}\b|\b\d+x\b|\b\d+\s?(users|customers|requests|queries|hours|days|ms|seconds|minutes|transactions|orders|downloads|stars|forks|contributions)\b)/gi;

export function analyzeProjects(parsed: ParsedResume): ProjectQuality[] {
  const projectText =
    getSectionText(parsed, "projects") ||
    getSectionText(parsed, "experience") ||
    "";

  if (!projectText) return [];

  // Split project text into entries. Heuristics:
  //  - A line that looks like a title (short, no bullet, often ends without period)
  //    followed by description lines until the next title.
  const lines = projectText.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries: { title: string; body: string[] }[] = [];
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    const isBullet = /^[-*•●▪◦·]/.test(line);
    const isTitleLike =
      !isBullet &&
      line.length <= 70 &&
      line.split(/\s+/).length <= 9 &&
      !/[.;]$/.test(line) &&
      !/@|https?:|\d{4}\s*[-–]\s*(present|current|\d{4})/i.test(line);

    if (isTitleLike && (!current || current.body.length > 0)) {
      if (current) entries.push(current);
      current = { title: line.replace(/[:\-—|*#.]+$/, "").trim(), body: [] };
    } else {
      if (!current) current = { title: "Untitled Project", body: [] };
      current.body.push(line);
    }
  }
  if (current) entries.push(current);

  return entries.map((e) => {
    const body = e.body.join(" ");
    const fullText = `${e.title} ${body}`.trim();
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    const hasDescription = body.split(/\s+/).filter(Boolean).length >= 8;
    const hasTechnologies = TECH_RE.test(fullText);
    TECH_RE.lastIndex = 0;
    const hasMetrics = METRIC_RE.test(fullText);
    METRIC_RE.lastIndex = 0;

    const issues: string[] = [];
    if (!hasDescription) issues.push("Missing a description of what the project does.");
    if (!hasTechnologies) issues.push("No technologies/tools listed.");
    if (!hasMetrics) issues.push("No measurable outcomes (%, count, time saved).");
    if (wordCount < 12) issues.push("Too brief — recruiters can't tell what you built.");

    let quality: ProjectQuality["quality"] = "strong";
    if (issues.length >= 2) quality = "weak";
    else if (issues.length === 1) quality = "average";

    const suggestion = buildProjectSuggestion(
      e.title,
      hasDescription,
      hasTechnologies,
      hasMetrics,
    );

    return {
      title: e.title || "Untitled Project",
      rawText: fullText,
      hasDescription,
      hasTechnologies,
      hasMetrics,
      wordCount,
      quality,
      issues,
      suggestion,
    };
  });
}

function buildProjectSuggestion(
  title: string,
  hasDesc: boolean,
  hasTech: boolean,
  hasMetrics: boolean,
): string {
  const cleanTitle = title.replace(/[:\-—|*#.]+$/, "").trim() || "Your project";
  const tech = hasTech ? "" : " using [technology, e.g. React, Node.js, MongoDB]";
  const metric = hasMetrics
    ? ""
    : " [add a measurable result, e.g. reducing load time by 40%]";
  const verb = hasDesc ? "Expanded:" : "Built";
  return `${verb} ${cleanTitle}${tech}${metric}.`;
}
