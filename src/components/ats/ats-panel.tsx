"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { calculateATSScore, getATSScoreLabel } from "@/engines/ats/ats-engine";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lightbulb, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Circular progress ring ── */
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const gradientId = "ats-score-gradient";

  // Colour stops based on score
  const [colorA, colorB] =
    score >= 80
      ? ["#22c55e", "#16a34a"]   // green
      : score >= 60
        ? ["#f59e0b", "#d97706"]  // amber
        : score >= 40
          ? ["#f97316", "#ea580c"] // orange
          : ["#ef4444", "#dc2626"]; // red

  const textColor =
    score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : score >= 40 ? "text-orange-500" : "text-red-500";

  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center" role="img" aria-label={`ATS score: ${score} out of 100`}>
      <svg
        className="-rotate-90"
        width="144"
        height="144"
        viewBox="0 0 144 144"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorA} />
            <stop offset="100%" stopColor={colorB} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx="72"
          cy="72"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/40"
        />
        {/* Progress */}
        <circle
          cx="72"
          cy="72"
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      {/* Score label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold tabular-nums", textColor)}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function getScoreMessage(score: number): string {
  if (score >= 90) return "Excellent — your resume is ATS-ready.";
  if (score >= 70) return "Good foundation — a few fixes could push you to 85+.";
  if (score >= 50) return "Needs improvement — focus on keywords and formatting.";
  return "Significant issues — let's fix the basics first.";
}

const severityBorder: Record<string, string> = {
  high:   "border-l-4 border-l-red-500",
  medium: "border-l-4 border-l-amber-500",
  low:    "border-l-4 border-l-slate-400",
};

const severityBadge = (severity: string): "destructive" | "warning" | "secondary" => {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "warning";
  return "secondary";
};

export function ATSPanel() {
  const data = useResumeStore((s) => s.data);
  const result = useMemo(() => calculateATSScore(data), [data]);
  const { label, color } = getATSScoreLabel(result.score);

  return (
    <div className="animate-fade-in space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">ATS Analysis</h2>
        <p className="text-sm text-muted-foreground">
          How well your resume performs with applicant tracking systems
        </p>
      </div>

      {/* Score ring card */}
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <ScoreRing score={result.score} />
        <p className={cn("mt-3 text-sm font-semibold", color)}>{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{getScoreMessage(result.score)}</p>
      </div>

      {/* Deductions */}
      {result.deductions.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <XCircle className="h-4 w-4 text-destructive" />
            Deductions
            <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {result.deductions.length}
            </span>
          </h3>
          {result.deductions.map((d, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-md",
                severityBorder[d.severity] ?? "border-l-4 border-l-slate-400",
              )}
            >
              <Badge variant={severityBadge(d.severity)} className="mt-0.5 shrink-0 tabular-nums">
                -{d.points}
              </Badge>
              <div className="min-w-0">
                <p className="text-sm font-medium">{d.category}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{d.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Recommendations
          </h3>
          <ul className="space-y-1.5">
            {result.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border bg-card p-2.5 text-sm shadow-sm"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All clear */}
      {result.deductions.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-green-50 py-10 text-center dark:bg-green-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-medium text-green-700 dark:text-green-400">No issues found!</p>
          <p className="text-sm text-green-600/80 dark:text-green-500/80">Your resume is ATS-ready.</p>
        </div>
      )}
    </div>
  );
}
