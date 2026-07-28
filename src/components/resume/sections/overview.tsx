"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "../score-ring";
import type { AnalysisResult } from "@/lib/analyzer/types";
import {
  FileText,
  Gauge,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-500";
  if (grade.startsWith("B")) return "text-amber-500";
  if (grade.startsWith("C")) return "text-orange-500";
  return "text-red-500";
}

export function OverviewSection({ result }: { result: AnalysisResult }) {
  const { ats, parsed, classification, length, suggestions, completeness, weakSentences, keywords, projects } = result;
  const critical = suggestions.filter((s) => s.category === "critical");
  const positives = suggestions.filter((s) => s.category === "positive");
  const topImprovements = suggestions
    .filter((s) => s.category === "improvement" || s.category === "critical")
    .slice(0, 4);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Score hero */}
      <Card className="lg:col-span-1 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="h-4 w-4 text-primary" /> ATS Score
          </CardTitle>
          <CardDescription>Overall resume strength</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 pt-2">
          <ScoreRing score={ats.overall} size={170} label="out of 100" sublabel={ats.gradeLabel} />
          <div className="text-center">
            <div className={cn("text-3xl font-bold", gradeColor(ats.grade))}>
              Grade {ats.grade}
            </div>
            <div className="text-muted-foreground text-sm">{ats.gradeLabel}</div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Layers className="h-3 w-3" /> {classification.label}
          </Badge>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <Card className="lg:col-span-2 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" /> At a glance
          </CardTitle>
          <CardDescription>Key metrics from your resume</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile icon={<FileText className="h-4 w-4" />} label="Words" value={parsed.wordCount} />
          <StatTile icon={<FileText className="h-4 w-4" />} label="Pages" value={length.pages} />
          <StatTile label="Length" value={length.status.replace("_", " ")} tone={length.status === "ideal" ? "good" : "warn"} />
          <StatTile label="Completeness" value={`${completeness.overall}%`} tone={completeness.overall >= 70 ? "good" : "warn"} />
          <StatTile label="ATS keywords" value={`${keywords.matched.length}/${keywords.totalScanned}`} />
          <StatTile label="Weak sentences" value={weakSentences.length} tone={weakSentences.length === 0 ? "good" : "warn"} />
          <StatTile label="Action verbs" value={result.actionVerbs.used.length} />
          <StatTile label="Projects" value={projects.length} tone={projects.length >= 2 ? "good" : "warn"} />
          <StatTile label="Readability" value={`${result.readability.fleschScore}`} />
        </CardContent>
      </Card>

      {/* Top suggestions */}
      <Card className="lg:col-span-2 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Top recommendations
          </CardTitle>
          <CardDescription>The highest-impact changes to make</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {topImprovements.length === 0 && (
            <p className="text-sm text-muted-foreground">No critical issues — great work!</p>
          )}
          {topImprovements.map((s) => (
            <div key={s.id} className="flex gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="mt-0.5">
                {s.category === "critical" ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <Target className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{s.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{s.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What's good */}
      <Card className="lg:col-span-1 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> What's working
          </CardTitle>
          <CardDescription>Strengths to keep</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {positives.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keep applying suggestions to build strengths.</p>
          ) : (
            positives.slice(0, 4).map((s) => (
              <div key={s.id} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <p className="text-xs leading-snug">
                  <span className="font-medium">{s.title}.</span>{" "}
                  <span className="text-muted-foreground">{s.detail}</span>
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Completeness mini */}
      <Card className="lg:col-span-3 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-primary" /> Resume completeness
          </CardTitle>
          <CardDescription>How complete each section is</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-3">
            <ScoreRing score={completeness.overall} size={70} stroke={8} />
            <p className="text-sm text-muted-foreground">
              Overall completeness. Aim for 85%+ across all sections for maximum ATS compatibility.
            </p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {completeness.items.map((it) => (
              <div key={it.section}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{it.section}</span>
                  <span className="tabular-nums text-muted-foreground">{it.percent}%</span>
                </div>
                <Progress
                  value={it.percent}
                  className={cn("h-1.5", it.percent >= 70 ? "[&>div]:bg-emerald-500" : it.percent >= 40 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500")}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: "good" | "warn" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-500"
      : tone === "warn"
        ? "text-amber-500"
        : tone === "bad"
          ? "text-red-500"
          : "text-foreground";
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {icon}
        {label}
      </div>
      <div className={cn("mt-1 text-lg font-semibold capitalize tabular-nums", toneClass)}>
        {value}
      </div>
    </div>
  );
}
