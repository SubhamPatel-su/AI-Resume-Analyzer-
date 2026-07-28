// AI suggestions engine + improvement checklist (rule-based).
import {
  ParsedResume,
  AnalysisResult,
  Suggestion,
  ChecklistItem,
} from "./types";

let suggestionId = 0;
function makeSuggestion(
  category: Suggestion["category"],
  title: string,
  detail: string,
  section?: string,
): Suggestion {
  return { id: `s${++suggestionId}`, category, title, detail, section };
}

export function buildSuggestions(result: Omit<AnalysisResult, "suggestions" | "checklist">): {
  suggestions: Suggestion[];
  checklist: ChecklistItem[];
} {
  const suggestions: Suggestion[] = [];
  const { parsed, ats, weakSentences, keywords, projects, readability, formatting, length, skills } = result;
  const c = parsed.contact;

  // --- Critical ---
  if (!c.email) {
    suggestions.push(makeSuggestion("critical", "Add a professional email address", "Recruiters and ATS need an email to contact you. Place it near your name at the top.", "Contact"));
  }
  if (!parsed.sections.some((s) => s.id === "skills" || s.id === "technicalSkills") || !parsed.sections.find((s) => (s.id === "skills" || s.id === "technicalSkills") && s.present)) {
    suggestions.push(makeSuggestion("critical", "Add a Skills section", "ATS systems scan for a dedicated Skills section. List technical and soft skills as a comma-separated list.", "Skills"));
  }
  if (!parsed.sections.find((s) => s.id === "projects" && s.present)) {
    suggestions.push(makeSuggestion("critical", "Add a Projects section", "For freshers, projects are the strongest signal of ability. Add 2–4 projects with technologies and outcomes.", "Projects"));
  }
  if (length.status === "too_short") {
    suggestions.push(makeSuggestion("critical", "Resume is too short", length.recommendation, "Length"));
  }

  // --- Improvement ---
  if (!c.github) {
    suggestions.push(makeSuggestion("improvement", "Add your GitHub profile", "A GitHub link lets recruiters verify your code. Add it next to your contact info.", "Contact"));
  }
  if (!c.linkedin) {
    suggestions.push(makeSuggestion("improvement", "Add your LinkedIn profile", "LinkedIn is expected on modern resumes and improves recruiter discoverability.", "Contact"));
  }
  if (weakSentences.length > 0) {
    suggestions.push(makeSuggestion("improvement", `Rewrite ${weakSentences.length} weak/passive sentence(s)`, "Replace phrases like 'responsible for' and 'worked on' with strong action verbs and measurable outcomes.", "Experience"));
  }
  if (keywords.missing.length > 0 && keywords.matched.length < 18) {
    const sample = keywords.missing.slice(0, 5).map((k) => k.keyword).join(", ");
    suggestions.push(makeSuggestion("improvement", "Increase ATS keyword coverage", `You're missing common ATS keywords such as: ${sample}. Add the ones genuinely relevant to your target role.`, "Skills"));
  }
  const weakProjects = projects.filter((p) => p.quality === "weak");
  if (weakProjects.length > 0) {
    suggestions.push(makeSuggestion("improvement", `Strengthen ${weakProjects.length} project(s)`, "Each project should name the technology and a measurable result. Example: 'Built a library system using Java & MySQL, cutting manual work by 80%.'", "Projects"));
  }
  if (readability.fleschScore < 50) {
    suggestions.push(makeSuggestion("improvement", "Improve readability", "Sentences are hard to scan. Shorten them to ~15 words and prefer simple verbs. Target a Flesch score of 60+.", "Writing"));
  }
  if (readability.passiveVoicePct > 25) {
    suggestions.push(makeSuggestion("improvement", "Reduce passive voice", `${readability.passiveVoicePct}% of sentences use passive voice. Rewrite in active voice to sound more impactful.`, "Writing"));
  }
  const tableIssue = formatting.find((f) => f.type === "Tables");
  if (tableIssue) {
    suggestions.push(makeSuggestion("improvement", "Remove table layouts", "Tables often break ATS text extraction. Convert tabular info (e.g. exam scores) to plain lines.", "Formatting"));
  }
  if (length.status === "too_long") {
    suggestions.push(makeSuggestion("improvement", "Trim resume length", length.recommendation, "Length"));
  }

  // --- Tips ---
  const summarySec = parsed.sections.find((s) => (s.id === "summary" || s.id === "objective") && s.present);
  if (!summarySec) {
    suggestions.push(makeSuggestion("tip", "Add a 2–3 line summary", "A crisp summary at the top frames your profile for the recruiter. Avoid generic statements like 'hardworking student'.", "Summary"));
  } else if (summarySec.wordCount < 20) {
    suggestions.push(makeSuggestion("tip", "Expand your summary", "Your summary is very short. Add your target role, top 2 skills, and one achievement.", "Summary"));
  }
  if (!parsed.sections.find((s) => s.id === "achievements" && s.present)) {
    suggestions.push(makeSuggestion("tip", "Add an Achievements section", "Hackathon wins, scholarships, and leadership roles help you stand out from other freshers.", "Achievements"));
  }
  if (!parsed.sections.find((s) => s.id === "certifications" && s.present)) {
    suggestions.push(makeSuggestion("tip", "Add certifications", "Free certifications (NPTEL, Coursera, freeCodeCamp) strengthen your profile and add ATS keywords.", "Certifications"));
  }
  if (skills.total < 8) {
    suggestions.push(makeSuggestion("tip", "Broaden your skills list", `Only ${skills.total} skills detected. Add frameworks, tools, and soft skills relevant to your target role.`, "Skills"));
  }

  // --- Positive reinforcement ---
  if (ats.overall >= 85) {
    suggestions.push(makeSuggestion("positive", "Strong overall resume", `Your ATS score of ${ats.overall}/100 is ${ats.gradeLabel.toLowerCase()}. Polish the remaining suggestions to push past 90.`, "Overall"));
  }
  if (weakSentences.length === 0 && parsed.wordCount > 100) {
    suggestions.push(makeSuggestion("positive", "Clean, active writing", "No weak or passive phrases detected — great job using action verbs.", "Writing"));
  }
  if (keywords.matched.length >= 18) {
    suggestions.push(makeSuggestion("positive", "Excellent keyword coverage", `${keywords.matched.length} ATS keywords matched — your resume will surface in more searches.`, "Skills"));
  }
  if (projects.filter((p) => p.quality === "strong").length >= 2) {
    suggestions.push(makeSuggestion("positive", "Well-documented projects", "Multiple projects include technologies and measurable outcomes — exactly what recruiters want.", "Projects"));
  }
  if (c.github && c.linkedin) {
    suggestions.push(makeSuggestion("positive", "Complete professional links", "Both GitHub and LinkedIn are present — recruiters can verify your work easily.", "Contact"));
  }

  // Sort: critical > improvement > tip > positive
  const order = { critical: 0, improvement: 1, tip: 2, positive: 3 };
  suggestions.sort((a, b) => order[a.category] - order[b.category]);

  // --- Checklist ---
  const checklist: ChecklistItem[] = [
    { label: "Add GitHub link", done: !!c.github },
    { label: "Add LinkedIn link", done: !!c.linkedin },
    { label: "Include Projects section", done: !!parsed.sections.find((s) => s.id === "projects" && s.present) },
    { label: "Add measurable numbers", done: result.metricsMissingCount === 0 && parsed.wordCount > 100 },
    { label: "Use strong action verbs", done: weakSentences.length === 0 && result.actionVerbs.used.length >= 8 },
    { label: "Add Certifications", done: !!parsed.sections.find((s) => s.id === "certifications" && s.present) },
    { label: "Add Achievements", done: !!parsed.sections.find((s) => s.id === "achievements" && s.present) },
    { label: "Write a clear Summary", done: !!summarySec && summarySec.wordCount >= 20 },
    { label: "Cover ATS keywords (18+)", done: keywords.matched.length >= 18 },
    { label: "Keep to ideal length", done: length.status === "ideal" },
  ];

  return { suggestions, checklist };
}
