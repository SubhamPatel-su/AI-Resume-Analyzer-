// Keyword analyzer: matches the resume against the ATS keyword catalog.
import { KeywordResult, KeywordMatch } from "./types";
import { KEYWORD_CATALOG } from "./dictionaries";

export function analyzeKeywords(text: string): KeywordResult {
  const lower = " " + text.toLowerCase() + " ";
  const matched: KeywordMatch[] = [];
  const matchedSet = new Set<string>();
  const missing: KeywordMatch[] = [];

  for (const entry of KEYWORD_CATALOG) {
    const candidates = [entry.keyword, ...(entry.aliases || [])].map((c) =>
      c.toLowerCase(),
    );
    const isMatch = candidates.some((c) => {
      // word-boundary safe for alphanumeric; substring for symbols
      if (/^[a-z0-9]/.test(c) && /[a-z0-9]$/.test(c)) {
        return new RegExp(`\\b${escapeRegExp(c)}\\b`).test(lower);
      }
      return lower.includes(c);
    });
    if (isMatch) {
      matched.push({ keyword: entry.keyword, category: entry.category });
      matchedSet.add(entry.keyword.toLowerCase());
    } else {
      missing.push({ keyword: entry.keyword, category: entry.category });
    }
  }

  return {
    matched,
    missing,
    totalScanned: KEYWORD_CATALOG.length,
  };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Simple TF-based keyword extraction (top terms excluding stop words).
export function extractTopKeywords(text: string, limit = 15): { term: string; count: number }[] {
  const STOP = new Set([
    "a","an","the","and","or","but","if","for","of","to","in","on","at","by","with",
    "from","as","is","are","was","were","be","been","being","have","has","had","do",
    "does","did","will","would","should","could","can","i","you","he","she","it","we",
    "they","me","him","her","us","them","my","your","his","its","our","their","this",
    "that","these","those","am","not","no","so","than","too","very","just","also",
    "about","after","again","all","any","because","before","between","during","each",
    "more","most","other","over","some","such","through","under","up","down","out",
    "here","there","when","where","why","how","what","which","who","whom","while",
    "into","onto","upon","within","without","per","via","etc","ie","eg","get","got",
    "make","made","using","used","use","like","one","two","new","good","great","team",
    "work","worked","working","role","project","projects","experience","skills","skill",
    "university","college","school","year","years","month","months","present","jan",
    "feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec","january",
    "february","march","april","june","july","august","september","october","november",
    "december","education","summary","contact","email","phone","address","city","state",
  ]);
  const freq = new Map<string, number>();
  const tokens = (text.toLowerCase().match(/[a-z][a-z+#.]{1,}/g) || []);
  for (const t of tokens) {
    if (STOP.has(t) || t.length < 2) continue;
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return Array.from(freq.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
