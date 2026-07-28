"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "./dropzone";
import { useResumeStore } from "@/lib/store";
import { extractText } from "@/lib/extract";
import { analyzeResume } from "@/lib/analyzer";
import { SAMPLE_RESUME_TEXT } from "@/lib/extract/sample";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  Zap,
  Cpu,
  Lock,
  FileSearch,
  TrendingUp,
  Sparkles,
  History as HistoryIcon,
  ArrowRight,
  Gauge,
  PenLine,
  KeyRound,
  FolderGit2,
  CheckSquare,
  Languages,
} from "lucide-react";

const FEATURES = [
  { icon: Gauge, title: "ATS Score 0–100", desc: "6-category breakdown with grade A+ to F." },
  { icon: FileSearch, title: "Missing-section detection", desc: "Know exactly which sections ATS expects." },
  { icon: PenLine, title: "Weak-sentence rewrites", desc: "Turn 'responsible for' into strong, active bullets." },
  { icon: KeyRound, title: "Keyword analyzer", desc: "Match against 80+ ATS keywords across 8 categories." },
  { icon: FolderGit2, title: "Project quality checker", desc: "Flag projects missing tech, metrics, or descriptions." },
  { icon: CheckSquare, title: "Improvement checklist", desc: "A clear, actionable to-do list for your resume." },
];

export function HomeView() {
  const { setView, setProcessing, setResult, setError, addToHistory, history } = useResumeStore();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  async function runAnalysis(text: string, fileName: string, sourceType: "pdf" | "image" | "text") {
    setBusy(true);
    setError(null);
    setView("processing");
    try {
      setProcessing({ stage: "Analyzing text", pct: 90 });
      // small delay so the processing screen is visible on fast machines
      await new Promise((r) => setTimeout(r, 350));
      const result = analyzeResume(text, { fileName, sourceType });
      setProcessing({ stage: "Done", pct: 100 });
      await new Promise((r) => setTimeout(r, 200));
      addToHistory(result);
      setResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
      setView("home");
      toast({ title: "Analysis failed", description: "Could not analyze the resume.", variant: "destructive" });
    } finally {
      setBusy(false);
      setProcessing(null);
    }
  }

  async function handleFile(file: File) {
    setBusy(true);
    setView("processing");
    try {
      const { text, sourceType } = await extractText(file, (stage, pct) =>
        useResumeStore.getState().setProcessing({ stage, pct }),
      );
      if (!text || text.trim().length < 20) {
        throw new Error(
          "Could not extract enough text. If this is a scanned image, the OCR may have failed — try a clearer scan or a PDF with selectable text.",
        );
      }
      await runAnalysis(text, file.name, sourceType);
    } catch (e) {
      setBusy(false);
      setProcessing(null);
      setError(e instanceof Error ? e.message : "Extraction failed.");
      setView("home");
      toast({
        title: "Extraction failed",
        description: e instanceof Error ? e.message : "Unknown error.",
        variant: "destructive",
      });
    }
  }

  function handleSample() {
    runAnalysis(SAMPLE_RESUME_TEXT, "sample-resume.txt", "text");
  }

  function handlePaste(text: string) {
    runAnalysis(text, "pasted-resume.txt", "text");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-primary/10 via-card to-background p-6 sm:p-10">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Lock className="h-3 w-3" /> 100% offline · no login · no cloud
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Analyze your resume like an{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              ATS
            </span>
            , entirely in your browser.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
            Upload a PDF or image resume and get an instant ATS score, missing-section
            detection, weak-sentence rewrites, action-verb suggestions, and an exportable
            report — all processed locally. Nothing leaves your device.
          </p>

          <div className="mt-7 max-w-2xl">
            <Dropzone onFile={handleFile} onSample={handleSample} onPaste={handlePaste} disabled={busy} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Privacy-first</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Instant analysis</span>
            <span className="inline-flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-primary" /> On-device NLP</span>
            <span className="inline-flex items-center gap-1.5"><Languages className="h-3.5 w-3.5 text-primary" /> Works offline</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Everything a recruiter scan checks</h2>
            <p className="text-muted-foreground text-sm">A full ATS-grade report in seconds.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-colors hover:border-primary/40">
              <CardContent className="flex gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent history */}
      {history.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold">Recent analyses</h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setView("history")}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 3).map((h) => (
              <button
                key={h.id}
                onClick={() => useResumeStore.getState().loadFromHistory(h.id)}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{h.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.classification} · {timeAgo(h.createdAt)}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {h.overall}/100 · {h.grade}
                </Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">How it works</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { n: "1", t: "Import", d: "Drop a PDF, image, or paste text. PDFs are parsed locally; images go through in-browser OCR." },
            { n: "2", t: "Analyze", d: "A rule-based NLP pipeline parses sections, scores ATS, detects weak writing and missing keywords." },
            { n: "3", t: "Improve", d: "Follow prioritized suggestions and export a printable report to track your progress." },
          ].map((s) => (
            <Card key={s.n}>
              <CardContent className="p-5">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.n}
                </div>
                <p className="font-semibold">{s.t}</p>
                <p className="text-muted-foreground mt-1 text-sm">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
