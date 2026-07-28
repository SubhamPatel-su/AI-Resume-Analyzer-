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
import type { AnalysisResult } from "@/lib/analyzer/types";
import { KeyRound, Cpu, Tags, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function KeywordsSkillsSection({ result }: { result: AnalysisResult }) {
  const { keywords, skills, topKeywords } = result;
  const matchPct = Math.round(
    (keywords.matched.length / keywords.totalScanned) * 100,
  );

  // Group matched/missing by category
  const byCat = new Map<string, { matched: string[]; missing: string[] }>();
  for (const k of keywords.matched) {
    const c = byCat.get(k.category) || { matched: [], missing: [] };
    c.matched.push(k.keyword);
    byCat.set(k.category, c);
  }
  for (const k of keywords.missing) {
    const c = byCat.get(k.category) || { matched: [], missing: [] };
    c.missing.push(k.keyword);
    byCat.set(k.category, c);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Keyword match overview */}
      <Card className="lg:col-span-2 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" /> Keyword analyzer
          </CardTitle>
          <CardDescription>
            {keywords.matched.length} of {keywords.totalScanned} ATS keywords matched ({matchPct}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={matchPct} className="h-2" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(byCat.entries()).map(([cat, items]) => (
              <div key={cat} className="rounded-lg border bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {cat}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {items.matched.length}/{items.matched.length + items.missing.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {items.matched.map((k) => (
                    <Badge key={k} variant="secondary" className="gap-1 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                      {k}
                    </Badge>
                  ))}
                  {items.missing.slice(0, 8).map((k) => (
                    <Badge key={k} variant="outline" className="gap-1 text-[10px] opacity-60">
                      <XCircle className="h-2.5 w-2.5 text-muted-foreground" />
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills categorization */}
      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-4 w-4 text-primary" /> Skills analysis
          </CardTitle>
          <CardDescription>
            {skills.total} skill(s) categorized into {skills.categories.length} group(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {skills.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recognized skills found. Add a Skills section listing your technologies.
            </p>
          ) : (
            skills.categories.map((cat) => (
              <div key={cat.name}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Top keywords (TF) */}
      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tags className="h-4 w-4 text-primary" /> Most frequent terms
          </CardTitle>
          <CardDescription>
            Top words by frequency (after stop-word removal)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topKeywords.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough text to analyze.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topKeywords.map((k, i) => {
                const max = topKeywords[0].count || 1;
                const intensity = 0.4 + (k.count / max) * 0.6;
                return (
                  <span
                    key={k.term}
                    className={cn(
                      "rounded-md px-2 py-1 text-sm font-medium",
                      i < 3
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                    style={i >= 3 ? { opacity: intensity } : undefined}
                  >
                    {k.term}
                    <span className="ml-1 text-[10px] opacity-70">×{k.count}</span>
                  </span>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: ensure your target role's keywords appear naturally in your experience bullets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
