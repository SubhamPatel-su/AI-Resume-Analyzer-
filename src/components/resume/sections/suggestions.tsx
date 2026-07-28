"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult, Suggestion } from "@/lib/analyzer/types";
import {
  Sparkles,
  CheckSquare,
  AlertTriangle,
  Target,
  Lightbulb,
  CheckCircle2,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  Suggestion["category"],
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  critical: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Critical",
    color: "text-red-500",
    bg: "border-red-500/30 bg-red-500/5",
  },
  improvement: {
    icon: <Target className="h-4 w-4" />,
    label: "Improvement",
    color: "text-amber-500",
    bg: "border-amber-500/30 bg-amber-500/5",
  },
  tip: {
    icon: <Lightbulb className="h-4 w-4" />,
    label: "Tip",
    color: "text-sky-500",
    bg: "border-sky-500/30 bg-sky-500/5",
  },
  positive: {
    icon: <ThumbsUp className="h-4 w-4" />,
    label: "Strength",
    color: "text-emerald-500",
    bg: "border-emerald-500/30 bg-emerald-500/5",
  },
};

export function SuggestionsSection({ result }: { result: AnalysisResult }) {
  const { suggestions, checklist } = result;
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> AI suggestions
          </CardTitle>
          <CardDescription>
            {suggestions.length} personalized recommendation(s) from the offline analysis engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">No suggestions — your resume is in great shape!</p>
          )}
          {suggestions.map((s) => {
            const meta = CATEGORY_META[s.category];
            return (
              <div key={s.id} className={cn("flex gap-3 rounded-lg border p-3", meta.bg)}>
                <div className={cn("mt-0.5 shrink-0", meta.color)}>{meta.icon}</div>
                <div className="min-w-0">
                  <div className="mb-0.5 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium leading-snug">{s.title}</p>
                    <Badge variant="outline" className={cn("text-[10px]", meta.color)}>
                      {meta.label}
                    </Badge>
                    {s.section && (
                      <span className="text-[10px] text-muted-foreground">· {s.section}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{s.detail}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckSquare className="h-4 w-4 text-primary" /> Improvement checklist
          </CardTitle>
          <CardDescription>
            {doneCount}/{checklist.length} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${(doneCount / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2">
            {checklist.map((c, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    c.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/40",
                  )}
                >
                  {c.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
                <span className={cn(c.done ? "text-muted-foreground line-through" : "")}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
