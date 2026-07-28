// Readability analysis (Flesch Reading Ease + supporting metrics).
import { ReadabilityResult } from "./types";
import { STOP_WORDS } from "./dictionaries";

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

const COMPLEX_RE = /\b\w+\b/g;

export function analyzeReadability(text: string): ReadabilityResult {
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const words = (text.match(COMPLEX_RE) || []).filter(
    (w) => !STOP_WORDS.has(w.toLowerCase()) || true,
  );
  const wordCount = words.length || 1;
  const sentenceCount = Math.max(sentences.length, 1);
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  // Flesch Reading Ease
  let flesch = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  if (!isFinite(flesch)) flesch = 0;
  flesch = Math.max(0, Math.min(100, flesch));

  // Flesch-Kincaid grade level
  let grade =
    0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  if (!isFinite(grade) || grade < 0) grade = 0;

  // Complex word % (3+ syllables, not proper nouns)
  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;
  const complexWordPct = (complexWords / wordCount) * 100;

  // Passive voice %
  const passiveRe =
    /\b(?:was|were|been|being|is|are|am|be)\s+(?:[a-z]+ed|[a-z]+en)\b/gi;
  const passiveMatches = text.match(passiveRe) || [];
  const passiveVoicePct =
    sentenceCount > 0 ? (passiveMatches.length / sentenceCount) * 100 : 0;

  let label: string;
  if (flesch >= 80) label = "Very easy to read";
  else if (flesch >= 60) label = "Plain English — easy to read";
  else if (flesch >= 50) label = "Fairly easy to read";
  else if (flesch >= 30) label = "Difficult to read";
  else label = "Very difficult to read";

  return {
    fleschScore: Math.round(flesch),
    gradeLevel: Math.round(grade * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    complexWordPct: Math.round(complexWordPct * 10) / 10,
    passiveVoicePct: Math.round(passiveVoicePct * 10) / 10,
    label,
  };
}
