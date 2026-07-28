"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/store";
import { ChevronLeft, Lock, Cpu, Zap, ShieldCheck, Github, FileText, Code2 } from "lucide-react";

export function AboutView() {
  const { setView } = useResumeStore();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView("home")} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Home
        </Button>
        <h1 className="text-xl font-bold">About ResumeLens</h1>
      </div>

      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">The mission</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Millions of resumes are rejected by Applicant Tracking Systems before a recruiter
            ever sees them — often for fixable reasons like missing sections, weak verbs, or
            low keyword coverage. ResumeLens brings ATS-grade analysis to everyone, for free,
            without sending your personal data anywhere. Upload a resume, get an instant score,
            and learn exactly how to improve it.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" /> 100% client-side</Badge>
            <Badge variant="secondary" className="gap-1"><Cpu className="h-3 w-3" /> On-device NLP</Badge>
            <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" /> No API keys</Badge>
            <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" /> No tracking</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Cpu className="h-4 w-4 text-primary" /> How analysis works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <b className="text-foreground">Text extraction</b> — PDFs are parsed with pdf.js; images run through Tesseract OCR. Both happen in your browser.</p>
            <p>• <b className="text-foreground">Parsing</b> — A rule-based NLP engine detects sections, contact info, and entities.</p>
            <p>• <b className="text-foreground">Scoring</b> — 6 categories (Formatting, Sections, Keywords, Action Verbs, Readability, Grammar) produce an ATS score out of 100.</p>
            <p>• <b className="text-foreground">Suggestions</b> — A recommendation engine turns findings into prioritized, actionable advice.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-primary" /> Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• No login. No account. No server.</p>
            <p>• Your resume text never leaves your device.</p>
            <p>• History is stored only in your browser's local storage.</p>
            <p>• OCR for images downloads a one-time language model from a CDN; processing itself is local.</p>
            <p>• Clear your history anytime from the History tab.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-3">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><Code2 className="h-4 w-4 text-primary" /> Tech stack</CardTitle>
          <CardDescription>Built with a modern, fully-offline-capable stack.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "pdf.js", "Tesseract.js", "Zustand", "Recharts"].map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" /> Tips for best results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>• Use a PDF with <b className="text-foreground">selectable text</b> (not a scanned image) for the most accurate extraction.</p>
          <p>• If uploading an image, use a high-resolution, clearly lit scan.</p>
          <p>• Prefer single-column layouts — multi-column resumes confuse ATS parsers.</p>
          <p>• Re-analyze after each round of edits to watch your score climb.</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Github className="h-3.5 w-3.5" /> ResumeLens · an offline-first resume analyzer
      </div>
    </div>
  );
}
