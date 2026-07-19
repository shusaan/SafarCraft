"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { calculateATSScore, getATSScoreLabel } from "@/engines/ats/ats-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { trackEvent } from "@/engines/analytics";
import { CheckCircle, Lightbulb, XCircle, Plus, Sparkles, ArrowRight } from "lucide-react";
import { cn, generateId } from "@/lib/utils";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SUGGESTED_KEYWORDS = [
  "react", "typescript", "javascript", "python", "node.js", "aws",
  "docker", "kubernetes", "sql", "git", "ci/cd", "rest api",
  "agile", "microservices", "mongodb", "redis", "graphql", "terraform",
];

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
          cx="72" cy="72" r={RADIUS} fill="none" stroke={`url(#${gradientId})`}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
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

function getScoreMessage(score: number): string {
  if (score >= 90) return "Excellent — your resume is ATS-ready.";
  if (score >= 70) return "Good foundation — a few fixes could push you to 85+.";
  if (score >= 50) return "Needs improvement — focus on keywords and formatting.";
  return "Significant issues — let's fix the basics first.";
}

function findMissingKeywords(skills: string[], techs: string[]): string[] {
  const existing = new Set([...skills, ...techs].map((s) => s.toLowerCase()));
  return SUGGESTED_KEYWORDS.filter((kw) => !existing.has(kw));
}

export function ATSPanel() {
  const data = useResumeStore((s) => s.data);
  const updateData = useResumeStore((s) => s.updateData);
  const updateSkills = useResumeStore((s) => s.updateSkills);
  const resumeGoal = useResumeStore((s) => s.resumeGoal);
  const result = useMemo(() => calculateATSScore(data), [data]);
  const { label, color } = getATSScoreLabel(result.score);
  const [autoImproving, setAutoImproving] = useState(false);
  const [improveDone, setImproveDone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    trackEvent("analysis_complete", { score: result.score });
  }, [result.score]);

  const autoTriggered = useRef(false);
  useEffect(() => {
    if (result.score < 85 && !autoImproving && !improveDone && !autoTriggered.current && result.score > 0) {
      autoTriggered.current = true;
      handleAutoImprove();
    }
  }, [result.score]);

  const allTechs = useMemo(() => {
    const set = new Set<string>();
    data.experience.forEach((e) => e.technologies.forEach((t) => set.add(t)));
    data.projects.forEach((p) => p.technologies.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [data]);

  const missingKeywords = useMemo(() => {
    const skillNames = data.skills.flatMap((c) => c.skills);
    return findMissingKeywords(skillNames, allTechs);
  }, [data.skills, allTechs]);

  const strengths = useMemo(() => {
    const items: string[] = [];
    if (data.personal.name) items.push("Name provided");
    if (data.personal.email) items.push("Email provided");
    if (data.personal.summary) items.push("Professional summary included");
    if (data.experience.length > 0) items.push("Experience section present");
    if (data.education.length > 0) items.push("Education section present");
    if (data.skills.length > 0) items.push("Skills section present");
    if (data.experience.some((e) => e.bullets.some((b) => b.length > 0 && /\d/.test(b)))) items.push("Quantified achievements");
    if (data.experience.length > 2) items.push("Strong work history (3+ roles)");
    return items;
  }, [data]);

  const handleAutoImprove = async () => {
    setAutoImproving(true);
    try {
      const weakBullets: Array<{ expIndex: number; bulletIndex: number; text: string }> = [];
      data.experience.forEach((exp, ei) => {
        exp.bullets.forEach((b, bi) => {
          const firstWord = b.split(/\s+/)[0]?.toLowerCase();
          if (firstWord && ["was","were","been","had","has","have","did","made","got","worked","helped","responsible","handled","performed","provided","assisted","supported"].includes(firstWord)) {
            weakBullets.push({ expIndex: ei, bulletIndex: bi, text: b });
          }
        });
      });
      if (weakBullets.length === 0) {
        toast({ title: "No weak bullets to improve", variant: "default" });
        setAutoImproving(false);
        return;
      }
      const newExperience = [...data.experience];
      for (const wb of weakBullets) {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "improve-bullet", content: wb.text, context: resumeGoal }),
        });
        if (res.ok) {
          const data_ = await res.json();
          const improved = data_.result ?? wb.text;
          const bullets = [...newExperience[wb.expIndex]!.bullets];
          bullets[wb.bulletIndex] = improved;
          newExperience[wb.expIndex] = { ...newExperience[wb.expIndex]!, bullets };
        }
      }
      updateData({ experience: newExperience });
      setImproveDone(true);
      toast({ title: "Auto-improve complete", description: `Improved ${weakBullets.length} bullet(s)`, variant: "success" });
    } catch {
      toast({ title: "Auto-improve failed", description: "Try manually in the AI Assistant", variant: "destructive" });
    } finally {
      setAutoImproving(false);
    }
  };

  const highDeductions = result.deductions.filter((d) => d.severity === "high");
  const mediumDeductions = result.deductions.filter((d) => d.severity === "medium");
  const lowDeductions = result.deductions.filter((d) => d.severity === "low");

  const handleAddKeyword = (keyword: string) => {
    const existing = data.skills.find((c) => c.category === "Suggested");
    if (existing) {
      if (!existing.skills.includes(keyword)) {
        updateSkills(data.skills.map((c) => c.id === existing.id ? { ...c, skills: [...c.skills, keyword] } : c));
      }
    } else {
      updateSkills([...data.skills, { id: generateId(), category: "Suggested", skills: [keyword] }]);
    }
  };

  const handleAddAllKeywords = () => {
    const existing = data.skills.find((c) => c.category === "Suggested");
    const newSkills = missingKeywords.filter((kw) => !existing?.skills.includes(kw));
    if (existing) {
      updateSkills(data.skills.map((c) => c.id === existing.id ? { ...c, skills: [...c.skills, ...newSkills] } : c));
    } else {
      updateSkills([...data.skills, { id: generateId(), category: "Suggested", skills: newSkills }]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 p-6 overflow-y-auto">
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

      {/* Auto-improve banner */}
      {result.score >= 85 ? (
        <div className="rounded-2xl border bg-green-50 p-5 text-center dark:bg-green-950/20 shadow-sm">
          <CheckCircle className="mx-auto h-8 w-8 text-green-500" aria-hidden="true" />
          <p className="mt-2 font-semibold text-green-700 dark:text-green-400">Your resume scores {result.score}/100 — already ATS-ready!</p>
          <p className="mt-1 text-xs text-green-600/80 dark:text-green-500/80">No auto-rewrite needed. Review suggestions below if desired.</p>
          {result.deductions.length > 0 && (
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => document.getElementById("ats-suggestions")?.scrollIntoView({ behavior: "smooth" })}>
              <ArrowRight className="h-3.5 w-3.5" />
              Review Suggestions Manually
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border bg-amber-50 p-5 text-center dark:bg-amber-950/20 shadow-sm">
          <Sparkles className="mx-auto h-8 w-8 text-amber-500" aria-hidden="true" />
          <p className="mt-2 font-semibold text-amber-700 dark:text-amber-400">Score: {result.score}/100 — needs improvement</p>
          <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-500/80">Let AI improve your weak bullet points automatically.</p>
          <Button
            variant="default"
            size="sm"
            className="mt-3 gap-1.5"
            disabled={autoImproving || improveDone}
            onClick={handleAutoImprove}
          >
            {autoImproving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Improving...
              </span>
            ) : improveDone ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Done
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Auto-Improve with AI
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <XCircle className="h-4 w-4 text-destructive" />
              Missing Keywords
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {missingKeywords.length}
              </span>
            </h3>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleAddAllKeywords}>
              <Plus className="h-3 w-3" />
              Add All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((kw) => (
              <Badge
                key={kw}
                variant="destructive"
                className="cursor-pointer gap-1 px-2 py-1 text-xs"
                onClick={() => handleAddKeyword(kw)}
              >
                {kw}
                <Plus className="h-2.5 w-2.5" aria-hidden="true" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Deductions grouped by priority */}
      {result.deductions.length > 0 && (
        <div id="ats-suggestions" className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Suggestions
          </h3>

          {highDeductions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-destructive">Critical</p>
              {highDeductions.map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border-l-4 border-l-red-500 border bg-card p-3 shadow-sm">
                  <Badge variant="destructive" className="mt-0.5 shrink-0 tabular-nums">-{d.points}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{d.category}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mediumDeductions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-500">Important</p>
              {mediumDeductions.map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border-l-4 border-l-amber-500 border bg-card p-3 shadow-sm">
                  <Badge variant="warning" className="mt-0.5 shrink-0 tabular-nums">-{d.points}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{d.category}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lowDeductions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nice-to-have</p>
              {lowDeductions.map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border-l-4 border-l-slate-400 border bg-card p-3 shadow-sm">
                  <Badge variant="secondary" className="mt-0.5 shrink-0 tabular-nums">-{d.points}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{d.category}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-green-500" />
            Strengths
          </h3>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border bg-card p-2.5 text-sm shadow-sm">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All clear */}
      {result.deductions.length === 0 && missingKeywords.length === 0 && (
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
