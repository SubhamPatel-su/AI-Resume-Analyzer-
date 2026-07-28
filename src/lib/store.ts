"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisResult } from "@/lib/analyzer/types";

export type View = "home" | "processing" | "dashboard" | "history" | "about";

export interface HistoryEntry {
  id: string;
  fileName: string;
  sourceType: "pdf" | "image" | "text";
  overall: number;
  grade: string;
  gradeLabel: string;
  wordCount: number;
  classification: string;
  createdAt: number;
  // We store the full result for re-viewing; it's small enough.
  result: AnalysisResult;
}

interface Analytics {
  totalAnalyzed: number;
  averageScore: number;
  bestScore: number;
  byGrade: Record<string, number>;
  commonMistakes: { label: string; count: number }[];
}

interface ResumeState {
  view: View;
  current: AnalysisResult | null;
  processing: { stage: string; pct: number } | null;
  history: HistoryEntry[];
  error: string | null;

  setView: (v: View) => void;
  setProcessing: (p: { stage: string; pct: number } | null) => void;
  setResult: (r: AnalysisResult | null) => void;
  setError: (e: string | null) => void;
  addToHistory: (r: AnalysisResult) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  loadFromHistory: (id: string) => void;
  analytics: () => Analytics;
}

function computeAnalytics(history: HistoryEntry[]): Analytics {
  if (history.length === 0) {
    return {
      totalAnalyzed: 0,
      averageScore: 0,
      bestScore: 0,
      byGrade: {},
      commonMistakes: [],
    };
  }
  const total = history.length;
  const sum = history.reduce((s, h) => s + h.overall, 0);
  const best = history.reduce((b, h) => Math.max(b, h.overall), 0);
  const byGrade: Record<string, number> = {};
  const mistakeMap = new Map<string, number>();
  for (const h of history) {
    byGrade[h.grade] = (byGrade[h.grade] || 0) + 1;
    for (const p of h.result.ats.penalties) {
      if (p.points > 0) {
        mistakeMap.set(p.rule, (mistakeMap.get(p.rule) || 0) + 1);
      }
    }
  }
  const commonMistakes = Array.from(mistakeMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  return {
    totalAnalyzed: total,
    averageScore: Math.round(sum / total),
    bestScore: best,
    byGrade,
    commonMistakes,
  };
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      view: "home",
      current: null,
      processing: null,
      history: [],
      error: null,

      setView: (v) => set({ view: v, error: null }),
      setProcessing: (p) => set({ processing: p }),
      setResult: (r) => set({ current: r, view: r ? "dashboard" : "home" }),
      setError: (e) => set({ error: e }),

      addToHistory: (r) => {
        const entry: HistoryEntry = {
          id: `${r.createdAt}-${Math.random().toString(36).slice(2, 8)}`,
          fileName: r.fileName,
          sourceType: r.sourceType,
          overall: r.ats.overall,
          grade: r.ats.grade,
          gradeLabel: r.ats.gradeLabel,
          wordCount: r.parsed.wordCount,
          classification: r.classification.label,
          createdAt: r.createdAt,
          result: r,
        };
        set({ history: [entry, ...get().history].slice(0, 50) });
      },
      removeFromHistory: (id) =>
        set({ history: get().history.filter((h) => h.id !== id) }),
      clearHistory: () => set({ history: [] }),
      loadFromHistory: (id) => {
        const entry = get().history.find((h) => h.id === id);
        if (entry) set({ current: entry.result, view: "dashboard" });
      },
      analytics: () => computeAnalytics(get().history),
    }),
    {
      name: "resumelens-store",
      // Persist history only; transient view/processing/current are not persisted.
      partialize: (s) => ({ history: s.history }) as ResumeState,
    },
  ),
);
