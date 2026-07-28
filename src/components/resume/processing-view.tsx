"use client";

import { Progress } from "@/components/ui/progress";
import { useResumeStore } from "@/lib/store";
import { FileSearch, ScanLine, Brain, FileCheck2 } from "lucide-react";

const STAGES = [
  { icon: FileSearch, label: "Reading file" },
  { icon: ScanLine, label: "Extracting text" },
  { icon: Brain, label: "Analyzing" },
  { icon: FileCheck2, label: "Building report" },
];

export function ProcessingView() {
  const processing = useResumeStore((s) => s.processing);
  const pct = processing?.pct ?? 0;
  const stage = processing?.stage ?? "Working…";

  // map pct to active stage index
  const activeIdx =
    pct < 25 ? 0 : pct < 80 ? 1 : pct < 95 ? 2 : 3;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center px-6 py-20">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/10" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Brain className="h-9 w-9 animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl font-bold">Analyzing your resume…</h2>
      <p className="text-muted-foreground mt-1 text-sm">{stage}</p>

      <div className="mt-6 w-full">
        <Progress value={pct} className="h-2" />
        <p className="text-muted-foreground mt-1.5 text-right text-xs tabular-nums">{pct}%</p>
      </div>

      <div className="mt-8 grid w-full grid-cols-4 gap-2">
        {STAGES.map((s, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <div
              key={s.label}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-colors ${
                active
                  ? "border-primary bg-primary/5"
                  : done
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "opacity-50"
              }`}
            >
              <s.icon
                className={`h-4 w-4 ${
                  active ? "text-primary animate-pulse" : done ? "text-emerald-500" : "text-muted-foreground"
                }`}
              />
              <span className="text-[10px] leading-tight text-muted-foreground">{s.label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground mt-8 max-w-sm text-center text-xs">
        All processing happens locally in your browser. Nothing is uploaded.
      </p>
    </div>
  );
}
