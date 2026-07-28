"use client";

import * as React from "react";
import Link from "next/link";
import { useResumeStore, type View } from "@/lib/store";
import { ThemeToggle } from "./theme-toggle";
import { HomeView } from "./home-view";
import { ProcessingView } from "./processing-view";
import { DashboardView } from "./dashboard-view";
import { HistoryView } from "./history-view";
import { AboutView } from "./about-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanSearch, Home, History as HistoryIcon, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { view: View; label: string; icon: React.ElementType }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "history", label: "History", icon: HistoryIcon },
  { view: "about", label: "About", icon: Info },
];

export function AppShell() {
  const view = useResumeStore((s) => s.view);
  const current = useResumeStore((s) => s.current);
  const historyCount = useResumeStore((s) => s.history.length);
  const setView = useResumeStore((s) => s.setView);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="no-print sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ScanSearch className="h-4.5 w-4.5" />
            </div>
            <div className="leading-none">
              <span className="block text-sm font-bold tracking-tight">ResumeLens</span>
              <span className="block text-[10px] text-muted-foreground">Offline ATS Analyzer</span>
            </div>
          </button>

          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
              const active = view === n.view || (n.view === "home" && view === "processing") || (n.view === "home" && view === "dashboard");
              return (
                <Button
                  key={n.view}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className="relative gap-1.5"
                  onClick={() => setView(n.view)}
                >
                  <n.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{n.label}</span>
                  {n.view === "history" && historyCount > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                      {historyCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {view === "home" && <HomeView />}
        {view === "processing" && <ProcessingView />}
        {view === "dashboard" && current && <DashboardView result={current} />}
        {view === "dashboard" && !current && <HomeView />}
        {view === "history" && <HistoryView />}
        {view === "about" && <AboutView />}
      </main>

      {/* Footer (sticky to bottom) */}
      <footer className="no-print mt-auto border-t bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                100% offline · your resume never leaves this device
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Built with Next.js · pdf.js · Tesseract.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
