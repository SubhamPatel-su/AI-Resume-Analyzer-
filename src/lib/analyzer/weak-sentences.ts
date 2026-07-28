// Weak sentence detection + action verb analysis.
import { WeakSentence } from "./types";
import { WEAK_PHRASE_RULES, ACTION_VERBS } from "./dictionaries";

export function splitSentences(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  // Split on newlines first (preserves bullet structure), then on sentence
  // boundaries within each line.
  const lines = text.split(/\n+/);
  for (const line of lines) {
    let l = line.trim();
    if (!l) continue;
    // strip leading bullet markers
    l = l.replace(/^[-*•●▪◦·]+\s*/, "");
    if (!l) continue;
    const parts = l.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);
    for (const p of parts) {
      const t = p.trim();
      if (t.split(/\s+/).length >= 3) out.push(t);
    }
  }
  return out;
}

// Passive voice heuristic: "was/were/been/is/are + past-participle (word ending in -ed)"
const PASSIVE_RE =
  /\b(?:was|were|been|being|is|are|am|be)\s+(?:[a-z]+ed|[a-z]+en)\b/gi;

export function detectWeakSentences(text: string): WeakSentence[] {
  const sentences = splitSentences(text);
  const results: WeakSentence[] = [];

  for (const sentence of sentences) {
    for (const rule of WEAK_PHRASE_RULES) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(sentence)) {
        results.push({
          sentence,
          type: rule.type,
          issue: rule.issue,
          suggestion: rule.suggestion,
          improved: rule.improve(sentence),
        });
        break; // one classification per sentence
      }
    }

    // Passive voice detection (only if not already flagged)
    const existing = results.find((r) => r.sentence === sentence);
    if (!existing) {
      PASSIVE_RE.lastIndex = 0;
      if (PASSIVE_RE.test(sentence)) {
        results.push({
          sentence,
          type: "passive",
          issue:
            "Passive voice hides your contribution and reads as duty-focused.",
          suggestion:
            "Rewrite in active voice: lead with the action verb and name the outcome.",
          improved: sentence.replace(
            /\b(was|were|been|being|is|are|am)\s+([a-z]+)(ed|en)\b/gi,
            (_m, _be, base, _ending) => {
              const lead = base.charAt(0).toUpperCase() + base.slice(1);
              return `${lead}ed`;
            },
          ),
        });
      }
    }
  }

  return results;
}

// Action verbs used in the resume (from the strong list).
export function findActionVerbsUsed(text: string): string[] {
  const lower = text.toLowerCase();
  const used = new Set<string>();
  for (const verb of ACTION_VERBS) {
    const re = new RegExp(`\\b${verb.replace(/[.\\+$*?()[\]{}|]/g, "\\$&")}\\b`, "i");
    if (re.test(lower)) used.add(verb);
  }
  return Array.from(used).sort();
}

// Recommend action verbs not yet used, based on detected domain.
export function recommendActionVerbs(used: string[], context: string): string[] {
  const usedSet = new Set(used);
  const lower = context.toLowerCase();
  // Context-aware picks
  const domainPicks: string[] = [];
  if (/develop|code|software|app|web|api|backend|frontend/i.test(context)) {
    domainPicks.push("developed", "engineered", "architected", "shipped", "deployed");
  }
  if (/data|analy|model|machine learning|ml|ai/i.test(context)) {
    domainPicks.push("analyzed", "modeled", "benchmarked", "optimized", "validated");
  }
  if (/lead|manage|team|drive|own/i.test(context)) {
    domainPicks.push("led", "spearheaded", "orchestrated", "mentored", "drove");
  }
  if (/improve|reduce|increase|optimi|speed|performance/i.test(context)) {
    domainPicks.push("optimized", "reduced", "accelerated", "streamlined", "improved");
  }
  const fallback = [
    "developed", "built", "designed", "implemented", "optimized", "delivered",
    "achieved", "led", "automated", "improved",
  ];
  const pool = [...domainPicks, ...fallback];
  const recommended = pool.filter((v) => !usedSet.has(v));
  // Dedupe preserving order, cap at 12
  return Array.from(new Set(recommended)).slice(0, 12);
}

// Count sentences that lack measurable results (no number/percent).
export function countSentencesWithoutMetrics(text: string): number {
  const sentences = splitSentences(text);
  const without = sentences.filter((s) => !/\d+\s?%|\$\s?\d|\b\d{2,}\b|\b\d+x\b/i.test(s));
  return without.length;
}
