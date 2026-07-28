"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/lib/analyzer/types";
import { BarChart3, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScoreBreakdownSection({ result }: { result: AnalysisResult }) {
  const { breakdown, penalties, overall, grade, gradeLabel } = result.ats;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" /> Score breakdown
          </CardTitle>
          <CardDescription>
            Overall {overall}/100 · Grade {grade} ({gradeLabel})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {breakdown.map((b) => {
            const pct = (b.score / b.max) * 100;
            const color =
              pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : pct >= 40 ? "bg-orange-500" : "bg-red-500";
            return (
              <div key={b.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{b.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{b.note}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {b.score}
                    <span className="text-muted-foreground">/{b.max}</span>
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-primary" /> ATS penalties
          </CardTitle>
          <CardDescription>
            {penalties.length === 0
              ? "No penalties applied — clean resume!"
              : `${penalties.length} factor(s) lowered your score`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {penalties.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              Excellent — no ATS penalties were triggered.
            </div>
          ) : (
            <ul className="space-y-2">
              {penalties.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{p.rule}</p>
                    {p.reason && (
                      <p className="text-muted-foreground mt-0.5 text-xs">{p.reason}</p>
                    )}
                  </div>
                  {p.points > 0 && (
                    <Badge variant="outline" className="shrink-0 border-red-500/40 text-red-500">
                      −{p.points}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
