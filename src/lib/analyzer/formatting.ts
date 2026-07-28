// Formatting analyzer: detects ATS-unsafe or inconsistent formatting from raw text.
import { FormattingIssue } from "./types";

const ICON_RE = /[★✦✓✔❯»▶◀•●▪◆◇♦♠♣♥♪☀☎✉✎✦]/g;
const EMoji_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu;

export function analyzeFormatting(raw: string, sourceType: "pdf" | "image" | "text"): FormattingIssue[] {
  const issues: FormattingIssue[] = [];

  // Special symbols / icons (ATS-unfriendly)
  const icons = raw.match(ICON_RE) || [];
  const emojis = raw.match(EMoji_RE) || [];
  if (icons.length + emojis.length > 0) {
    issues.push({
      type: "Icons / symbols",
      severity: "warning",
      message: `${icons.length + emojis.length} decorative symbol(s) detected (★ ✓ ❯ …). ATS parsers often garble these — remove them.`,
    });
  }

  // Tabs suggest multi-column layouts which ATS often mis-parse
  const tabs = (raw.match(/\t/g) || []).length;
  if (tabs >= 3) {
    issues.push({
      type: "Tabs / columns",
      severity: "warning",
      message: `${tabs} tab character(s) found — multi-column layouts can break ATS text extraction. Prefer a single-column layout.`,
    });
  }

  // Pipe / table characters
  const pipes = (raw.match(/\|/g) || []).length;
  if (pipes >= 4) {
    issues.push({
      type: "Tables",
      severity: "warning",
      message: "Table-like structure detected (| characters). Tables often fail ATS parsing — convert to plain text.",
    });
  }

  // Mixed bullet markers
  const bulletChars = (raw.match(/[•●▪◦·]/g) || []).length;
  const dashBullets = (raw.match(/^\s*[-*]\s/gm) || []).length;
  if (bulletChars > 0 && dashBullets > 0) {
    issues.push({
      type: "Bullet style",
      severity: "info",
      message: "Mixed bullet markers (symbols and dashes). Standardize on one style.",
    });
  }

  // ALL-CAPS lines (shouting / hard to parse)
  const capsLines = raw
    .split("\n")
    .filter((l) => l.trim().length > 6 && l === l.toUpperCase() && /[A-Z]{2,}/.test(l));
  if (capsLines.length > 4) {
    issues.push({
      type: "All caps",
      severity: "info",
      message: `${capsLines.length} fully-capitalized line(s). Use Title Case for headers — all-caps can hurt readability and OCR.`,
    });
  }

  // Image source → OCR caveats
  if (sourceType === "image") {
    issues.push({
      type: "Image resume",
      severity: "info",
      message:
        "Resume was OCR'd from an image. Text extraction may have errors — please verify names, dates, and numbers manually.",
    });
  }

  // Very long lines (suggest tight columns)
  const longLines = raw.split("\n").filter((l) => l.length > 140).length;
  if (longLines > 3) {
    issues.push({
      type: "Long lines",
      severity: "info",
      message: `${longLines} very long line(s) (>140 chars). May indicate a dense single block — break into bullets.`,
    });
  }

  // Non-ASCII / smart quotes
  const smartQuotes = (raw.match(/[“”‘’]/g) || []).length;
  if (smartQuotes > 0) {
    issues.push({
      type: "Smart quotes",
      severity: "info",
      message: `${smartQuotes} smart/curly quote(s) detected. Prefer straight quotes for ATS safety.`,
    });
  }

  return issues;
}
