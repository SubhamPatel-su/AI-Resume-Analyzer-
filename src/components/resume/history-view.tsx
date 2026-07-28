"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/store";
import {
  Trash2,
  Eye,
  ChevronLeft,
  BarChart3,
  Trophy,
  TrendingUp,
  AlertOctagon,
  Inbox,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function HistoryView() {
  const { history, setView, removeFromHistory, clearHistory, analytics } = useResumeStore();
  const a = analytics();
  const { toast } = useToast();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("home")} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Home
          </Button>
          <div>
            <h1 className="text-xl font-bold">History & analytics</h1>
            <p className="text-muted-foreground text-xs">All stored locally on this device.</p>
          </div>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive"
            onClick={() => {
              clearHistory();
              toast({ title: "History cleared" });
            }}
          >
            <Trash2 className="h-4 w-4" /> Clear all
          </Button>
        )}
      </div>

      {/* Analytics */}
      {history.length > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Resumes analyzed" value={a.totalAnalyzed} />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Average score" value={a.averageScore} suffix="/100" />
          <StatCard icon={<Trophy className="h-4 w-4" />} label="Best score" value={a.bestScore} suffix="/100" />
          <StatCard
            icon={<AlertOctagon className="h-4 w-4" />}
            label="Most common mistake"
            value={a.commonMistakes[0]?.label ?? "—"}
            small
          />
        </div>
      )}

      {/* Grade distribution */}
      {history.length > 0 && Object.keys(a.byGrade).length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Grade distribution</CardTitle>
            <CardDescription>How your resumes rank overall</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["A+", "A", "B+", "B", "C", "D", "F"].map((g) => {
                const count = a.byGrade[g] || 0;
                if (count === 0) return null;
                const tone =
                  g.startsWith("A") ? "bg-emerald-500" : g.startsWith("B") ? "bg-amber-500" : g.startsWith("C") ? "bg-orange-500" : "bg-red-500";
                return (
                  <div key={g} className={`flex items-center gap-2 rounded-lg ${tone} px-3 py-1.5 text-sm font-medium text-white`}>
                    {g} <span className="opacity-80">×{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No analyses yet</p>
            <p className="text-muted-foreground text-sm">Your analyzed resumes will appear here.</p>
            <Button className="mt-2" onClick={() => setView("home")}>Analyze your first resume</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {history.map((h) => (
            <Card key={h.id} className="transition-colors hover:border-primary/40">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{h.fileName}</p>
                    <Badge variant="outline" className="text-[10px]">{h.sourceType.toUpperCase()}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {h.classification} · {h.wordCount} words · {new Date(h.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="tabular-nums">
                    {h.overall}/100 · {h.grade}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => useResumeStore.getState().loadFromHistory(h.id)}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      removeFromHistory(h.id);
                      toast({ title: "Removed from history" });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  suffix?: string;
  small?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {icon}
          {label}
        </div>
        <div className={`mt-1 font-bold tabular-nums ${small ? "text-base" : "text-2xl"}`}>
          {value}
          {suffix && <span className="text-muted-foreground text-sm font-normal">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
