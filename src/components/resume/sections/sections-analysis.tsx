"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult, SectionId } from "@/lib/analyzer/types";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_META: { id: SectionId; label: string; importance: "core" | "recommended" | "optional" }[] = [
  { id: "contact", label: "Contact Info", importance: "core" },
  { id: "summary", label: "Summary / Objective", importance: "core" },
  { id: "education", label: "Education", importance: "core" },
  { id: "experience", label: "Experience", importance: "core" },
  { id: "internships", label: "Internships", importance: "core" },
  { id: "projects", label: "Projects", importance: "core" },
  { id: "skills", label: "Skills", importance: "core" },
  { id: "technicalSkills", label: "Technical Skills", importance: "core" },
  { id: "achievements", label: "Achievements", importance: "recommended" },
  { id: "certifications", label: "Certifications", importance: "recommended" },
  { id: "languages", label: "Languages", importance: "optional" },
  { id: "volunteer", label: "Volunteer / Extracurricular", importance: "optional" },
  { id: "publications", label: "Publications", importance: "optional" },
  { id: "references", label: "References", importance: "optional" },
];

export function SectionsAnalysisSection({ result }: { result: AnalysisResult }) {
  const sections = result.parsed.sections;
  const present = sections.filter((s) => s.present).map((s) => s.id);
  const missing = SECTION_META.filter(
    (m) => !present.includes(m.id),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sections detected
          </CardTitle>
          <CardDescription>
            {present.length} section(s) found in your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {SECTION_META.map((m) => {
              const sec = sections.find((s) => s.id === m.id);
              const isPresent = sec?.present;
              return (
                <li
                  key={m.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border p-2 text-sm",
                    isPresent ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/20 opacity-70",
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {isPresent ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{m.label}</span>
                  </span>
                  <ImportanceBadge importance={m.importance} />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="print-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-amber-500" /> Missing sections
          </CardTitle>
          <CardDescription>
            Recommended additions to improve ATS compatibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missing.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              All tracked sections are present — well done!
            </div>
          ) : (
            <ul className="space-y-2">
              {missing.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-2.5"
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{m.label}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {adviceFor(m.id)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ImportanceBadge({ importance }: { importance: "core" | "recommended" | "optional" }) {
  const map = {
    core: { label: "Core", variant: "default" as const, className: "" },
    recommended: { label: "Recommended", variant: "secondary" as const, className: "" },
    optional: { label: "Optional", variant: "outline" as const, className: "" },
  };
  const m = map[importance];
  return (
    <Badge variant={m.variant} className={cn("shrink-0 text-[10px]", m.className)}>
      {m.label}
    </Badge>
  );
}

function adviceFor(id: SectionId): string {
  const map: Record<SectionId, string> = {
    contact: "Ensure name, email, phone and links appear at the top.",
    summary: "Add a 2–3 line professional summary framing your profile.",
    objective: "Add a focused career objective tailored to the role.",
    education: "List your degree, institution, year and CGPA.",
    experience: "Add work experience with quantified achievements.",
    internships: "List internships with role, duration and impact.",
    projects: "Add 2–4 projects with technologies and outcomes.",
    skills: "Include a Skills section listing technical & soft skills.",
    technicalSkills: "Call out your technical stack explicitly.",
    softSkills: "Mention soft skills (leadership, teamwork, etc.).",
    achievements: "Add awards, hackathon wins, scholarships.",
    certifications: "Add relevant certifications (NPTEL, Coursera, etc.).",
    languages: "List languages you speak with proficiency.",
    publications: "List research papers or publications.",
    volunteer: "Add volunteer or extracurricular activities.",
    references: "Add 'Available on request' or referee contacts.",
  };
  return map[id];
}
