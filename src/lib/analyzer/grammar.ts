// Grammar suggestions (offline, rule-based).
import { GrammarIssue } from "./types";

export function checkGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  // Double spaces
  const doubleSpaces = text.match(/ {2,}/g);
  if (doubleSpaces) {
    const idx = text.search(/ {2,}/);
    issues.push({
      type: "Whitespace",
      message: `${doubleSpaces.length} instance(s) of double/multiple spaces detected.`,
      excerpt: text.slice(Math.max(0, idx - 20), idx + 8),
      fix: "Replace multiple spaces with a single space.",
    });
  }

  // Repeated words (e.g., "the the")
  const repeated = text.match(/\b(\w+)\s+\1\b/gi);
  if (repeated) {
    issues.push({
      type: "Repeated word",
      message: `Repeated word detected: "${repeated[0]}".`,
      excerpt: repeated[0],
      fix: "Remove the duplicate word.",
    });
  }

  // Sentence capitalization (sentences not starting with a capital)
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 3);
  const uncapitalized = sentences.filter((s) => /^[a-z]/.test(s));
  if (uncapitalized.length) {
    issues.push({
      type: "Capitalization",
      message: `${uncapitalized.length} sentence(s) do not start with a capital letter.`,
      excerpt: uncapitalized[0].slice(0, 50),
      fix: "Capitalize the first letter of each sentence.",
    });
  }

  // Long sentences (> 30 words)
  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 30);
  if (longSentences.length) {
    issues.push({
      type: "Long sentence",
      message: `${longSentences.length} sentence(s) exceed 30 words — hard to scan.`,
      excerpt: longSentences[0].slice(0, 60) + "...",
      fix: "Split long sentences into concise, achievement-focused bullets.",
    });
  }

  // Inconsistent bullet markers
  const bulletChars = text.match(/[•●▪◦·]/g);
  const dashes = text.match(/^\s*[-*]\s/gm);
  if (bulletChars && dashes) {
    issues.push({
      type: "Bullet style",
      message: "Mixed bullet markers (symbols and dashes) detected.",
      excerpt: "• ...  vs  - ...",
      fix: "Use a single, consistent bullet style (prefer '-').",
    });
  }

  // "i" used as lowercase pronoun
  const lowerI = text.match(/\bi\b/g);
  if (lowerI) {
    issues.push({
      type: "Capitalization",
      message: `Lowercase "i" found ${lowerI.length} time(s) — should be "I".`,
      excerpt: "i",
      fix: 'Capitalize the pronoun "I".',
    });
  }

  // Excessive exclamation
  const excl = text.match(/!{2,}/g);
  if (excl) {
    issues.push({
      type: "Tone",
      message: "Multiple exclamation marks detected — resumes should stay professional.",
      excerpt: excl[0],
      fix: "Use a single punctuation mark or rephrase.",
    });
  }

  // Long paragraphs (blocks separated by blank lines with > 6 lines)
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  const longParas = paragraphs.filter(
    (p) => p.split("\n").filter(Boolean).length > 6,
  );
  if (longParas.length) {
    issues.push({
      type: "Paragraph length",
      message: `${longParas.length} paragraph(s) are very long — recruiters skim, so break them up.`,
      excerpt: longParas[0].slice(0, 60) + "...",
      fix: "Break long paragraphs into 2–4 line bullet points.",
    });
  }

  return issues;
}
