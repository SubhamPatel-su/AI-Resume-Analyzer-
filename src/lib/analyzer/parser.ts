// Resume parser: cleans text, extracts contact info, detects sections.
import {
  ParsedResume,
  ContactInfo,
  SectionInfo,
  SectionId,
} from "./types";
import { SECTION_HEADERS } from "./dictionaries";

export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[•●▪◦·]/g, "- ")
    .trim();
}

function countWords(text: string): number {
  const m = text.trim().match(/\b[\w@./+-]+\b/g);
  return m ? m.length : 0;
}

export function extractContact(text: string): ContactInfo {
  const contact: ContactInfo = {
    name: null,
    email: null,
    phone: null,
    linkedin: null,
    github: null,
    portfolio: null,
    location: null,
  };

  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) contact.email = emailMatch[0];

  // Phone (international + domestic variants)
  const phoneMatch = text.match(
    /(\+?\d{1,3}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/,
  );
  if (phoneMatch && phoneMatch[0].replace(/\D/g, "").length >= 10) {
    contact.phone = phoneMatch[0].trim();
  }

  // LinkedIn
  const liMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/[A-Za-z0-9_-]+\/?/i,
  );
  if (liMatch) contact.linkedin = liMatch[0];

  // GitHub
  const ghMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+\/?/i,
  );
  if (ghMatch) contact.github = ghMatch[0];

  // Portfolio / personal site
  const urlMatches = text.match(/https?:\/\/[^\s)]+/gi) || [];
  const personal = urlMatches.find(
    (u) =>
      !/linkedin|github|facebook|twitter|x\.com|instagram|hackerrank|leetcode|behance|dribbble/i.test(
        u,
      ),
  );
  if (personal) contact.portfolio = personal;

  // Name — first non-empty line that isn't a section header, url, email, or phone
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 6)) {
    const isContactLine =
      /@|https?:|\+?\d{2,}|\d{3,}[\s.-]\d{3,}/.test(line);
    const looksLikeHeader = /^(summary|experience|education|skills|projects|objective|contact|profile)\b/i.test(
      line,
    );
    const isNameLike =
      /^[A-Z][a-zA-Z'`-]+(?:\s+[A-Z][a-zA-Z'`.-]+){1,3}$/.test(line) &&
      line.length <= 40;
    if (!isContactLine && !looksLikeHeader && isNameLike) {
      contact.name = line;
      break;
    }
  }

  // Location — heuristic: line containing city, state/country indicators
  const locMatch = text.match(
    /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?,\s*(?:[A-Z][a-zA-Z]+|[A-Z]{2,3}))\b/,
  );
  if (locMatch) contact.location = locMatch[1];

  return contact;
}

// Find the line index where a section header appears.
function findSectionHeader(lines: string[], synonyms: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase().replace(/[:\-—|*#.]/g, "").trim();
    if (synonyms.includes(lower)) return i;
    // also match "header | other" or "header -" style
    for (const s of synonyms) {
      if (lower === s || lower.startsWith(s + " ") || lower.endsWith(" " + s)) {
        return i;
      }
    }
  }
  return -1;
}

export function detectSections(cleaned: string): SectionInfo[] {
  const lines = cleaned.split("\n");
  const ids = Object.keys(SECTION_HEADERS) as SectionId[];
  const headerPositions: { id: SectionId; idx: number }[] = [];

  for (const id of ids) {
    const idx = findSectionHeader(lines, SECTION_HEADERS[id]);
    if (idx >= 0) headerPositions.push({ id, idx });
  }

  headerPositions.sort((a, b) => a.idx - b.idx);

  // Include "contact" explicitly — it's derived, not header-based.
  const allIds: SectionId[] = [...ids, "contact"];
  const sections: SectionInfo[] = allIds.map((id) => ({
    id,
    label: labelFor(id),
    present: false,
    text: "",
    lineCount: 0,
    wordCount: 0,
  }));

  for (let i = 0; i < headerPositions.length; i++) {
    const { id, idx } = headerPositions[i];
    const endIdx =
      i + 1 < headerPositions.length ? headerPositions[i + 1].idx : lines.length;
    // skip the header line itself; gather body
    const body = lines.slice(idx + 1, endIdx).join("\n").trim();
    const sec = sections.find((s) => s.id === id)!;
    sec.present = body.replace(/[\s-]/g, "").length > 0;
    sec.text = body;
    sec.lineCount = body ? body.split("\n").filter(Boolean).length : 0;
    sec.wordCount = countWords(body);
  }

  // Contact section is special — derived from presence of contact info
  const contactSection = sections.find((s) => s.id === "contact")!;
  contactSection.present =
    lines.slice(0, Math.min(8, lines.length)).some((l) =>
      /@|https?:\/\/|\+?\d{2,}[\s.-]\d{3,}/.test(l),
    );
  contactSection.text = lines.slice(0, Math.min(8, lines.length)).join("\n");
  contactSection.lineCount = contactSection.present ? 1 : 0;
  contactSection.wordCount = countWords(contactSection.text);

  return sections;
}

function labelFor(id: SectionId): string {
  const map: Record<SectionId, string> = {
    summary: "Summary",
    objective: "Objective",
    education: "Education",
    experience: "Experience",
    internships: "Internships",
    projects: "Projects",
    skills: "Skills",
    technicalSkills: "Technical Skills",
    softSkills: "Soft Skills",
    achievements: "Achievements",
    certifications: "Certifications",
    languages: "Languages",
    publications: "Publications",
    volunteer: "Volunteer / Extracurricular",
    references: "References",
    contact: "Contact",
  };
  return map[id];
}

export function parseResume(raw: string): ParsedResume {
  const cleaned = cleanText(raw);
  const contact = extractContact(cleaned);
  const sections = detectSections(cleaned);
  const wordCount = countWords(cleaned);
  const lineCount = cleaned.split("\n").filter(Boolean).length;
  const charCount = cleaned.length;
  // Estimate pages: ~600 words per page is a common resume density
  const pageCount = Math.max(1, Math.round(wordCount / 550) || 1);

  return {
    rawText: raw,
    cleanedText: cleaned,
    contact,
    sections,
    wordCount,
    lineCount,
    pageCount,
    charCount,
  };
}

export function getSectionText(parsed: ParsedResume, ...ids: SectionId[]): string {
  for (const id of ids) {
    const sec = parsed.sections.find((s) => s.id === id);
    if (sec && sec.present && sec.text) return sec.text;
  }
  return "";
}
