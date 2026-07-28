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
import {
  PenLine,
  Zap,
  SpellCheck2,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WritingSection({ result }: { result: AnalysisResult }) {
  const { weakSentences, actionVerbs, grammar, readability } = result;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Weak sentences */}
      <Card className="lg:col-span-2 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PenLine className="h-4 w-4 text-primary" /> Weak sentence detection
          </CardTitle>
          <CardDescription>
            {weakSentences.length === 0
              ? "No weak or passive sentences found — excellent writing!"
              : `${weakSentences.length} sentence(s) to strengthen`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weakSentences.length === 0 ? (
            <EmptyGood text="All scanned sentences use strong, active phrasing." />
          ) : (
            <ul className="space-y-3">
              {weakSentences.slice(0, 12).map((w, i) => (
                <li key={i} className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-[10px]",
                        w.type === "weak" && "border-red-500/40 text-red-500",
                        w.type === "passive" && "border-amber-500/40 text-amber-500",
                        w.type === "generic" && "border-orange-500/40 text-orange-500",
                        w.type === "vague" && "border-purple-500/40 text-purple-500",
                      )}
                    >
                      {w.type}
                    </Badge>
                  </div>
                  <p className="text-sm italic text-muted-foreground">“{truncate(w.sentence, 160)}”</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Issue:</span> {w.issue}
                  </p>
                  <div className="mt-2 flex items-start gap-2 rounded-md bg-emerald-500/10 p-2">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Suggested rewrite</p>
                      <p className="text-sm">{truncate(w.improved, 200)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Action verbs */}
      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" /> Action verbs
          </CardTitle>
          <CardDescription>
            {actionVerbs.used.length} strong verb(s) used · {actionVerbs.recommended.length} recommended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Used in your resume</p>
          {actionVerbs.used.length === 0 ? (
            <p className="text-sm text-muted-foreground">None detected — add achievement bullets starting with strong verbs.</p>
          ) : (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {actionVerbs.used.map((v) => (
                <Badge key={v} variant="secondary" className="capitalize">
                  {v}
                </Badge>
              ))}
            </div>
          )}
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Try adding these</p>
          <div className="flex flex-wrap gap-1.5">
            {actionVerbs.recommended.map((v) => (
              <Badge key={v} variant="outline" className="capitalize border-primary/40 text-primary">
                {v}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Readability */}
      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" /> Readability
          </CardTitle>
          <CardDescription>{readability.label}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <ReadabilityRow label="Flesch reading ease" value={readability.fleschScore} max={100} suffix="/100" />
          <ReadabilityRow label="Grade level" value={readability.gradeLevel} max={12} suffix="" decimals={1} />
          <ReadabilityRow label="Avg. sentence length" value={readability.avgSentenceLength} max={25} suffix=" words" decimals={1} invert />
          <ReadabilityRow label="Complex words" value={readability.complexWordPct} max={100} suffix="%" invert />
          <ReadabilityRow label="Passive voice" value={readability.passiveVoicePct} max={100} suffix="%" invert />
          <p className="text-xs text-muted-foreground">
            Target: Flesch 60+, passive voice below 15%, sentences under 20 words.
          </p>
        </CardContent>
      </Card>

      {/* Grammar */}
      <Card className="lg:col-span-2 print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <SpellCheck2 className="h-4 w-4 text-primary" /> Grammar & style
          </CardTitle>
          <CardDescription>
            {grammar.length === 0 ? "No style issues detected." : `${grammar.length} issue(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {grammar.length === 0 ? (
            <EmptyGood text="Writing style looks clean and consistent." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {grammar.map((g, i) => (
                <li key={i} className="rounded-lg border bg-muted/30 p-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {g.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{g.message}</p>
                  {g.excerpt && (
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">“{g.excerpt}”</p>
                  )}
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">→ {g.fix}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReadabilityRow({
  label,
  value,
  max,
  suffix,
  decimals = 0,
  invert = false,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  decimals?: number;
  invert?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  // For "invert" metrics (lower is better), color flips.
  const good = invert ? value <= max * 0.3 : value >= max * 0.6;
  const warn = invert ? value <= max * 0.6 : value >= max * 0.4;
  const color = good
    ? "[&>div]:bg-emerald-500"
    : warn
      ? "[&>div]:bg-amber-500"
      : "[&>div]:bg-red-500";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value.toFixed(decimals)}
          {suffix}
        </span>
      </div>
      <Progress value={pct} className={cn("h-1.5", color)} />
    </div>
  );
}

function EmptyGood({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-4 w-4" /> {text}
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
