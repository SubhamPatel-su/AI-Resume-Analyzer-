"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult, ProjectQuality } from "@/lib/analyzer/types";
import { FolderGit2, CheckCircle2, XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectsSection({ result }: { result: AnalysisResult }) {
  const { projects } = result;

  return (
    <Card className="print-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderGit2 className="h-4 w-4 text-primary" /> Project quality checker
        </CardTitle>
        <CardDescription>
          {projects.length === 0
            ? "No projects detected — add a Projects section to showcase your work."
            : `${projects.length} project(s) analyzed for description, technologies, and measurable results.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Add at least 2–4 projects with technologies and quantified outcomes.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {projects.map((p, i) => (
              <ProjectCard key={i} project={p} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: ProjectQuality }) {
  const qualityConfig = {
    strong: { color: "border-emerald-500/40 bg-emerald-500/5", badge: "border-emerald-500/40 text-emerald-500", label: "Strong" },
    average: { color: "border-amber-500/40 bg-amber-500/5", badge: "border-amber-500/40 text-amber-500", label: "Needs work" },
    weak: { color: "border-red-500/40 bg-red-500/5", badge: "border-red-500/40 text-red-500", label: "Weak" },
  }[project.quality];

  return (
    <div className={cn("rounded-xl border p-4", qualityConfig.color)}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-semibold leading-snug">{project.title}</h4>
        <Badge variant="outline" className={cn("shrink-0", qualityConfig.badge)}>
          {qualityConfig.label}
        </Badge>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {project.wordCount} words · {project.rawText.split("\n")[0].slice(0, 80)}
        {project.rawText.length > 80 ? "…" : ""}
      </p>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <Check label="Description" ok={project.hasDescription} />
        <Check label="Technologies" ok={project.hasTechnologies} />
        <Check label="Metrics" ok={project.hasMetrics} />
      </div>

      {project.issues.length > 0 && (
        <ul className="mb-3 space-y-1">
          {project.issues.map((iss, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
              {iss}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-start gap-2 rounded-md bg-background/60 p-2">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-xs">
          <span className="font-medium">Suggested:</span> {project.suggestion}
        </p>
      </div>
    </div>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="rounded-md border bg-background/40 p-1.5">
      {ok ? (
        <CheckCircle2 className="mx-auto mb-0.5 h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <XCircle className="mx-auto mb-0.5 h-3.5 w-3.5 text-red-500" />
      )}
      <p className={cn("text-[10px]", ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
        {label}
      </p>
    </div>
  );
}
