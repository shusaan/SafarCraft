"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useResumeStore } from "@/stores/resume-store";
import { useJDStore } from "@/stores/jd-store";
import { calculateATSScore } from "@/engines/ats/ats-engine";
import { runExportParseBenchmark, type ParseBenchmarkResult } from "@/engines/export/parse-benchmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/engines/analytics";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileCheck2,
  Lightbulb,
  Loader2,
  Plus,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import type { ATSDeduction, ResumeData } from "@/types";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
  const gradientId = "ats-score-gradient";

  const [colorA, colorB] =
    score >= 80
      ? ["#22c55e", "#16a34a"]
      : score >= 60
        ? ["#f59e0b", "#d97706"]
        : score >= 40
          ? ["#f97316", "#ea580c"]
          : ["#ef4444", "#dc2626"];

  const textColor =
    score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : score >= 40 ? "text-orange-500" : "text-red-500";

  return (
    <div className="relative mx-auto flex h-36 w-36 items-center justify-center" role="img" aria-label={`ATS score: ${score} out of 100`}>
      <svg className="-rotate-90" width="144" height="144" viewBox="0 0 144 144" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorA} />
            <stop offset="100%" stopColor={colorB} />
          </linearGradient>
        </defs>
        <circle cx="72" cy="72" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/40" />
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
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold tabular-nums", textColor)}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail?: string;
}) {
  const barColor =
    value >= 80 ? "bg-green-500" : value >= 60 ? "bg-amber-500" : value >= 40 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium">{label}</p>
          {detail && <p className="text-[11px] text-muted-foreground">{detail}</p>}
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums">{value}%</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value}%`}
      >
        <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ExportParseSection({ data }: { data: ResumeData }) {
  const [results, setResults] = useState<ParseBenchmarkResult[] | null>(null);
  const [checking, setChecking] = useState(false);

  const run = async () => {
    setChecking(true);
    try {
      setResults(await runExportParseBenchmark(data));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FileCheck2 className="h-4 w-4 text-primary" />
            Export parse check
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Generates your DOCX export, then verifies that the fields an ATS needs survive the round trip.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={run} disabled={checking} className="gap-1.5">
          {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck2 className="h-3.5 w-3.5" />}
          {checking ? "Checking..." : "Run check"}
        </Button>
      </div>

      {results && (
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((result) => {
            const failed = result.checks.filter((check) => !check.found);
            return (
              <div key={result.format} className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide">{result.format}</p>
                  {result.passed ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Needs attention
                    </Badge>
                  )}
                </div>
                {result.error ? (
                  <p className="mt-2 text-xs text-muted-foreground">{result.error}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {result.checks.length} fields checked · {result.textLength.toLocaleString()} characters recovered
                  </p>
                )}
                {failed.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                    {failed.slice(0, 4).map((check) => (
                      <li key={check.field}>• {check.field} was not found</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        HTML export is checked by automated tests across all templates. PDF export uses your browser&apos;s print dialog,
        so its text is covered by browser tests rather than a runtime parser.
      </p>
    </div>
  );
}

function DeductionCard({ deduction }: { deduction: ATSDeduction }) {
  const badgeVariant =
    deduction.severity === "high" ? "destructive" : deduction.severity === "medium" ? "warning" : "secondary";
  const border =
    deduction.severity === "high"
      ? "border-l-red-500"
      : deduction.severity === "medium"
        ? "border-l-amber-500"
        : "border-l-slate-400";

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border border-l-4 bg-card p-3 shadow-sm", border)}>
      <Badge variant={badgeVariant} className="mt-0.5 shrink-0 tabular-nums">
        -{deduction.points}
      </Badge>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium">{deduction.category}</p>
        <p className="text-xs text-muted-foreground">{deduction.reason}</p>
        {deduction.evidence && (
          <p className="rounded bg-muted/50 px-2 py-1 text-[11px] italic text-muted-foreground">
            “{deduction.evidence}”
          </p>
        )}
        <p className="text-xs">
          <span className="font-medium text-primary">Fix: </span>
          <span className="text-muted-foreground">{deduction.fix}</span>
        </p>
      </div>
    </div>
  );
}

export function ATSPanel() {
  const data = useResumeStore((s) => s.data);
  const updateSkills = useResumeStore((s) => s.updateSkills);
  const jdText = useJDStore((s) => s.jdText);
  const jdResult = useJDStore((s) => s.result);
  const result = useMemo(() => calculateATSScore(data, jdText), [data, jdText]);
  const { label, color } = result.label;

  useEffect(() => {
    trackEvent("analysis_complete", { score: result.score, hasJobMatch: Boolean(result.jobMatch) });
  }, [result.score, result.jobMatch]);

  const missingKeywords = result.jobMatch?.missingKeywords ?? jdResult?.missingSkills ?? [];
  const requiredKeywords = result.jobMatch?.requiredKeywords ?? [];
  const preferredKeywords = result.jobMatch?.preferredKeywords ?? [];

  const highDeductions = result.deductions.filter((deduction) => deduction.severity === "high");
  const mediumDeductions = result.deductions.filter((deduction) => deduction.severity === "medium");
  const lowDeductions = result.deductions.filter((deduction) => deduction.severity === "low");

  const handleAddKeyword = (keyword: string) => {
    const existing = data.skills.find((category) => category.category === "From Job Description");
    if (existing) {
      if (!existing.skills.includes(keyword)) {
        updateSkills(
          data.skills.map((category) =>
            category.id === existing.id ? { ...category, skills: [...category.skills, keyword] } : category,
          ),
        );
      }
    } else {
      updateSkills([...data.skills, { id: generateId(), category: "From Job Description", skills: [keyword] }]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 overflow-y-auto p-6">
      <div>
        <h2 className="text-lg font-semibold">ATS Analysis</h2>
        <p className="text-sm text-muted-foreground">
          General resume readiness plus a job-specific match you can act on.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <ScoreRing score={result.score} />
        <p className={cn("mt-3 text-sm font-semibold", color)}>{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {result.jobMatch
            ? "Overall score = 50% resume readiness + 50% job-description match."
            : "This is general readiness only. Add a job description to check targeting."}
        </p>

        {result.jobMatch ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <MetricBar label="Resume readiness" value={result.readinessScore} detail="50% of overall" />
            <MetricBar label="Job match" value={result.jobMatch.score} detail="50% of overall" />
          </div>
        ) : (
          <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
            <Link href="/builder?panel=jd">
              Add a job description
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      {result.jobMatch ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Job match
            </h3>
            <span className="text-xs text-muted-foreground">
              Level: {result.jobMatch.seniority === "not specified" ? "not stated" : result.jobMatch.seniority}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <MetricBar
              label="Required keywords"
              value={result.jobMatch.requiredCoverage}
              detail={`${requiredKeywords.length} required terms`}
            />
            <MetricBar
              label="Preferred keywords"
              value={result.jobMatch.preferredCoverage}
              detail={`${preferredKeywords.length} preferred terms`}
            />
            <MetricBar
              label="Skills overlap"
              value={result.jobMatch.skillsOverlap}
              detail="JD terms found in your skills section"
            />
            <MetricBar
              label="Seniority fit"
              value={result.jobMatch.seniorityFit}
              detail="JD level vs. your roles and dates"
            />
          </div>

          {missingKeywords.length > 0 ? (
            <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <XCircle className="h-4 w-4 text-destructive" />
                Missing from this job description
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {missingKeywords.length}
                </span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Click a keyword to add it to your skills. Only add terms you can honestly claim.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant={requiredKeywords.includes(keyword) ? "destructive" : "outline"}
                    className="cursor-pointer gap-1 px-2 py-1 text-xs"
                    onClick={() => handleAddKeyword(keyword)}
                    title={requiredKeywords.includes(keyword) ? "Required keyword" : "Preferred keyword"}
                  >
                    {keyword}
                    <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Every recognized keyword from this job description appears in your resume.
            </div>
          )}

          {result.jobMatch.matchedKeywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Matched keywords ({result.jobMatch.matchedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.jobMatch.matchedKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1 text-xs">
                    <CheckCircle className="h-2.5 w-2.5 text-green-600" aria-hidden="true" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-dashed bg-muted/30 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Keyword matching
          </h3>
          <p className="text-xs text-muted-foreground">
            {jdText
              ? "We could not find recognizable skills in that job description. Try pasting the requirements section."
              : "Paste a job description to see required vs. preferred keywords, coverage, and seniority fit — no generic guessing."}
          </p>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/builder?panel=jd">
              Open the JD Analyzer
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      <div className="space-y-3" aria-label="Resume readiness breakdown">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Resume readiness
          </h3>
          <span className="text-xs text-muted-foreground">weighted</span>
        </div>
        <div className="grid gap-2">
          {result.axes.map((axis) => (
            <MetricBar
              key={axis.id}
              label={axis.label}
              value={axis.score}
              detail={`${axis.description} · ${Math.round(axis.weight * 100)}% weight`}
            />
          ))}
        </div>
      </div>

      <ExportParseSection data={data} />

      {result.deductions.length > 0 && (
        <div id="ats-suggestions" className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Suggestions
          </h3>

          {highDeductions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-destructive">Critical</p>
              {highDeductions.map((deduction) => (
                <DeductionCard key={deduction.id} deduction={deduction} />
              ))}
            </div>
          )}

          {mediumDeductions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-500">Important</p>
              {mediumDeductions.map((deduction) => (
                <DeductionCard key={deduction.id} deduction={deduction} />
              ))}
            </div>
          )}

          {lowDeductions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nice-to-have</p>
              {lowDeductions.map((deduction) => (
                <DeductionCard key={deduction.id} deduction={deduction} />
              ))}
            </div>
          )}
        </div>
      )}

      {result.strengths.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Strengths
          </h3>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {result.strengths.map((strength) => (
              <div key={strength} className="flex items-center gap-2 rounded-lg border bg-card p-2.5 text-sm shadow-sm">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.deductions.length === 0 && missingKeywords.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-green-50 py-10 text-center dark:bg-green-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-medium text-green-700 dark:text-green-400">No readiness issues found.</p>
          <p className="text-sm text-green-600/80 dark:text-green-500/80">
            {result.jobMatch
              ? "Your resume covers every recognized keyword in this job description."
              : "Add a job description to check targeting for a specific role."}
          </p>
        </div>
      )}

      {!result.jobMatch && result.deductions.length > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          A high readiness score does not mean the resume matches a specific job. Add a job description for a targeted score.
        </p>
      )}
    </div>
  );
}
