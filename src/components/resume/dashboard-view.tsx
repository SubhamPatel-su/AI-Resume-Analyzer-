"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OverviewSection } from "./sections/overview";
import { ScoreBreakdownSection } from "./sections/score-breakdown";
import { SectionsAnalysisSection } from "./sections/sections-analysis";
import { WritingSection } from "./sections/writing";
import { KeywordsSkillsSection } from "./sections/keywords-skills";
import { ProjectsSection } from "./sections/projects";
import { SuggestionsSection } from "./sections/suggestions";
import type { AnalysisResult } from "@/lib/analyzer/types";
import { useResumeStore } from "@/lib/store";
import {
  Plus,
  Printer,
  Download,
  FileText,
  ChevronLeft,
  Layers,
  Gauge,
  PenLine,
  KeyRound,
  FolderGit2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DashboardView({ result }: { result: AnalysisResult }) {
  const { setView } = useResumeStore();
  const { toast } = useToast();

  function handlePrint() {
    window.print();
  }

  function handleExportTxt() {
    const txt = buildTextReport(result);
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^.]+$/, "")}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", description: "TXT report downloaded." });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Report header — sticky on screen, repeats in print */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("home")} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> New
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold">
              <FileText className="h-4 w-4 text-primary" />
              <span className="truncate">{result.fileName}</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {result.classification.label} · {result.parsed.wordCount} words ·{" "}
              {result.length.pages} page(s) · {result.sourceType.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportTxt} className="gap-1.5">
            <Download className="h-4 w-4" /> TXT
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* On-screen tabbed report */}
      <div className="no-print">
        <Tabs defaultValue="overview" className="w-full">
          <div className="scroll-thin mb-4 overflow-x-auto">
            <TabsList className="flex w-max gap-1">
              <TabsTrigger value="overview" className="gap-1.5">
                <Gauge className="h-3.5 w-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="score" className="gap-1.5">
                <Gauge className="h-3.5 w-3.5" /> ATS Score
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Sections
              </TabsTrigger>
              <TabsTrigger value="writing" className="gap-1.5">
                <PenLine className="h-3.5 w-3.5" /> Writing
              </TabsTrigger>
              <TabsTrigger value="keywords" className="gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Keywords & Skills
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-1.5">
                <FolderGit2 className="h-3.5 w-3.5" /> Projects
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Suggestions
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview"><OverviewSection result={result} /></TabsContent>
          <TabsContent value="score"><ScoreBreakdownSection result={result} /></TabsContent>
          <TabsContent value="sections"><SectionsAnalysisSection result={result} /></TabsContent>
          <TabsContent value="writing"><WritingSection result={result} /></TabsContent>
          <TabsContent value="keywords"><KeywordsSkillsSection result={result} /></TabsContent>
          <TabsContent value="projects"><ProjectsSection result={result} /></TabsContent>
          <TabsContent value="suggestions"><SuggestionsSection result={result} /></TabsContent>
        </Tabs>
      </div>

      {/* Print-only full report */}
      <div className="hidden print:block">
        <PrintHeader result={result} />
        <div className="space-y-6">
          <OverviewSection result={result} />
          <ScoreBreakdownSection result={result} />
          <SectionsAnalysisSection result={result} />
          <WritingSection result={result} />
          <KeywordsSkillsSection result={result} />
          <ProjectsSection result={result} />
          <SuggestionsSection result={result} />
        </div>
      </div>
    </div>
  );
}

function PrintHeader({ result }: { result: AnalysisResult }) {
  return (
    <div className="mb-4 border-b pb-3">
      <h1 className="text-xl font-bold">ResumeLens — Analysis Report</h1>
      <p className="text-sm">
        {result.fileName} · {result.classification.label} · ATS Score {result.ats.overall}/100 (Grade {result.ats.grade})
      </p>
      <p className="text-xs text-gray-500">
        Generated {new Date(result.createdAt).toLocaleString()} · 100% client-side analysis
      </p>
    </div>
  );
}

function buildTextReport(r: AnalysisResult): string {
  const lines: string[] = [];
  const sep = "=".repeat(60);
  lines.push(sep);
  lines.push("RESUMELENS — ANALYSIS REPORT");
  lines.push(sep);
  lines.push(`File: ${r.fileName}`);
  lines.push(`Source: ${r.sourceType.toUpperCase()}`);
  lines.push(`Classification: ${r.classification.label}`);
  lines.push(`Generated: ${new Date(r.createdAt).toLocaleString()}`);
  lines.push("");
  lines.push("ATS SCORE");
  lines.push("-".repeat(60));
  lines.push(`Overall: ${r.ats.overall}/100  (Grade ${r.ats.grade} — ${r.ats.gradeLabel})`);
  for (const b of r.ats.breakdown) {
    lines.push(`  ${b.label.padEnd(18)} ${b.score}/${b.max}  (${b.note})`);
  }
  if (r.ats.penalties.length) {
    lines.push("");
    lines.push("Penalties:");
    for (const p of r.ats.penalties) {
      lines.push(`  -${p.points}  ${p.rule} — ${p.reason}`);
    }
  }
  lines.push("");
  lines.push("SECTIONS DETECTED");
  lines.push("-".repeat(60));
  for (const s of r.parsed.sections) {
    if (s.present) lines.push(`  [x] ${s.label} (${s.wordCount} words)`);
  }
  lines.push("");
  lines.push("MISSING SECTIONS");
  lines.push("-".repeat(60));
  const missing = r.parsed.sections.filter((s) => !s.present);
  if (missing.length === 0) lines.push("  (none — all tracked sections present)");
  for (const s of missing) lines.push(`  [ ] ${s.label}`);
  lines.push("");
  lines.push("WEAK SENTENCES");
  lines.push("-".repeat(60));
  if (r.weakSentences.length === 0) lines.push("  (none)");
  for (const w of r.weakSentences) {
    lines.push(`  [${w.type}] ${w.sentence}`);
    lines.push(`       → ${w.improved}`);
  }
  lines.push("");
  lines.push("KEYWORDS");
  lines.push("-".repeat(60));
  lines.push(`Matched: ${r.keywords.matched.map((k) => k.keyword).join(", ") || "(none)"}`);
  lines.push(`Missing: ${r.keywords.missing.slice(0, 20).map((k) => k.keyword).join(", ")}`);
  lines.push("");
  lines.push("PROJECTS");
  lines.push("-".repeat(60));
  for (const p of r.projects) {
    lines.push(`  [${p.quality.toUpperCase()}] ${p.title}`);
    if (p.issues.length) lines.push(`       issues: ${p.issues.join("; ")}`);
    lines.push(`       suggestion: ${p.suggestion}`);
  }
  lines.push("");
  lines.push("SKILLS");
  lines.push("-".repeat(60));
  for (const c of r.skills.categories) {
    lines.push(`  ${c.name}: ${c.skills.join(", ")}`);
  }
  lines.push("");
  lines.push("READABILITY");
  lines.push("-".repeat(60));
  lines.push(`  Flesch: ${r.readability.fleschScore}/100 — ${r.readability.label}`);
  lines.push(`  Grade level: ${r.readability.gradeLevel}`);
  lines.push(`  Passive voice: ${r.readability.passiveVoicePct}%`);
  lines.push("");
  lines.push("SUGGESTIONS");
  lines.push("-".repeat(60));
  for (const s of r.suggestions) {
    lines.push(`  [${s.category.toUpperCase()}] ${s.title}`);
    lines.push(`       ${s.detail}`);
  }
  lines.push("");
  lines.push("IMPROVEMENT CHECKLIST");
  lines.push("-".repeat(60));
  for (const c of r.checklist) {
    lines.push(`  [${c.done ? "x" : " "}] ${c.label}`);
  }
  lines.push("");
  lines.push(sep);
  lines.push("Generated by ResumeLens — 100% offline, client-side analysis.");
  lines.push(sep);
  return lines.join("\n");
}
