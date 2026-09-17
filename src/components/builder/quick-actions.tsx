"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/stores/resume-store";
import { useToast } from "@/components/ui/toast";
import { suggestVerbFor, detectCategory, type ActionVerb } from "@/data/action-verbs";
import { REWRITER_PATTERNS, applyPatterns, detectWeakPatterns } from "@/engines/rewriter/patterns";
import { needsMetric, suggestMetricHint, detectCategory as detectMetricCategory, type MetricCategory } from "@/engines/rewriter/quantifier";
import { ACHIEVEMENT_TEMPLATES, pickTopAchievements, type AchievementRole } from "@/engines/rewriter/achievement-templates";
import { checkGrammar } from "@/engines/grammar/checker";
import { SummaryBuilder } from "@/components/builder/summary-builder";
import { CoverLetterGenerator } from "@/components/cover-letter/cover-letter";
import { QualityScore } from "@/components/quality/quality-score";
import { JDTailorMode } from "@/components/jd-analyzer/jd-tailor-mode";
import { SnippetLibrary } from "@/components/snippets/snippet-library";
import { InsightsDashboard } from "@/components/insights/insights-dashboard";
import { Zap, Wand2, Hash, FileText, ListChecks, CheckCircle2, Award, Target, BookmarkPlus, BarChart3 } from "lucide-react";

type Tool = "verbs" | "patterns" | "metrics" | "achievements" | "grammar" | "summary" | "cover-letter" | "quality" | "tailor" | "snippets" | "insights";

const TOOLS: Array<{ id: Tool; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "verbs", label: "Verb Swap", icon: Zap },
  { id: "patterns", label: "Bullet Rewrite", icon: Wand2 },
  { id: "metrics", label: "Add Metric", icon: Hash },
  { id: "achievements", label: "Achievements", icon: ListChecks },
  { id: "grammar", label: "Grammar", icon: FileText },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "cover-letter", label: "Cover Letter", icon: FileText },
  { id: "quality", label: "Quality", icon: Award },
  { id: "tailor", label: "JD Tailor", icon: Target },
  { id: "snippets", label: "Snippets", icon: BookmarkPlus },
  { id: "insights", label: "Insights", icon: BarChart3 },
];

type BulletRef = { text: string; expId: string; bulletIndex: number };

export function QuickActions() {
  const data = useResumeStore((s) => s.data);
  const { toast } = useToast();
  const [tool, setTool] = useState<Tool>("verbs");
  const [input, setInput] = useState("");

  const allBullets = useMemo<BulletRef[]>(
    () =>
      data.experience
        .flatMap((e) => e.bullets.map((b, i) => ({ text: b, expId: e.id, bulletIndex: i })))
        .filter((b) => b.text.trim()),
    [data.experience],
  );

  const applyBullet = (expId: string, bulletIndex: number, text: string) => {
    const next = useResumeStore.getState().data.experience.map((e) => {
      if (e.id !== expId) return e;
      const bullets = [...e.bullets];
      bullets[bulletIndex] = text;
      return { ...e, bullets };
    });
    useResumeStore.getState().updateData({ experience: next });
    toast({ title: "Bullet updated", variant: "success" });
  };

  return (
    <div className="animate-fade-in space-y-6 p-6 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">
          Local helpers — instant, offline, no API key.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={tool === id ? "default" : "outline"}
            size="sm"
            onClick={() => setTool(id)}
            className="gap-1.5"
            aria-pressed={tool === id}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {tool === "verbs" && <VerbSwapPanel bullets={allBullets} onApply={applyBullet} />}
      {tool === "patterns" && <PatternsPanel input={input} setInput={setInput} />}
      {tool === "metrics" && <MetricsPanel bullets={allBullets} onApply={applyBullet} />}
      {tool === "achievements" && <AchievementsPanel />}
      {tool === "grammar" && <GrammarPanel input={input} setInput={setInput} />}
      {tool === "summary" && <SummaryBuilder />}
      {tool === "cover-letter" && <CoverLetterGenerator />}
      {tool === "quality" && <QualityScore />}
      {tool === "tailor" && <JDTailorMode />}
      {tool === "snippets" && <SnippetLibrary />}
      {tool === "insights" && <InsightsDashboard />}
    </div>
  );
}

function VerbSwapPanel({ bullets, onApply }: { bullets: BulletRef[]; onApply: (expId: string, i: number, text: string) => void }) {
  const [selected, setSelected] = useState<string>("");

  if (bullets.length === 0) {
    return <Empty msg="Add some bullets to your experience first." />;
  }

  const currentKey = selected || `${bullets[0]!.expId}-${bullets[0]!.bulletIndex}`;
  const current = bullets.find((b) => `${b.expId}-${b.bulletIndex}` === currentKey) ?? bullets[0]!;
  const suggestions = suggestVerbFor(current.text);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Swap weak verb with a stronger one</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Bullet</Label>
          <select
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            value={`${current.expId}-${current.bulletIndex}`}
            onChange={(e) => setSelected(e.target.value)}
          >
            {bullets.map((b) => (
              <option key={`${b.expId}-${b.bulletIndex}`} value={`${b.expId}-${b.bulletIndex}`}>
                {b.text.slice(0, 60)}
                {b.text.length > 60 ? "…" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-md border bg-muted/40 p-2 text-sm">{current.text}</div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((v: ActionVerb) => (
            <Button
              key={v.verb}
              size="sm"
              variant="secondary"
              onClick={() => {
                const replaced = current.text.replace(/^\S+/, v.verb);
                onApply(current.expId, current.bulletIndex, replaced);
              }}
            >
              <Wand2 className="mr-1 h-3 w-3" /> {v.verb}
              <span className="ml-1 text-xs opacity-70">{v.domain}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Detected domain: {detectCategory(current.text)}</p>
      </CardContent>
    </Card>
  );
}

function PatternsPanel({ input, setInput }: { input: string; setInput: (v: string) => void }) {
  const [result, setResult] = useState("");

  const detected = input ? detectWeakPatterns(input) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Rewrite weak bullets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Paste a bullet</Label>
          <Textarea rows={3} value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., Was responsible for managing the team" />
        </div>
        {detected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {detected.map((p) => (
              <Badge key={p.name} variant="destructive">{p.name}</Badge>
            ))}
          </div>
        )}
        <Button onClick={() => setResult(applyPatterns(input))} disabled={!input.trim()}>
          <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Rewrite
        </Button>
        {result && (
          <div className="rounded-md border bg-green-50 p-2 text-sm dark:bg-green-950/20">
            <p className="mb-1 text-xs font-semibold text-green-700 dark:text-green-400">Result</p>
            {result}
          </div>
        )}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">{REWRITER_PATTERNS.length} patterns loaded</summary>
          <ul className="mt-2 grid grid-cols-2 gap-1">
            {REWRITER_PATTERNS.map((p) => (
              <li key={p.name}>• {p.name}</li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}

function MetricsPanel({ bullets, onApply }: { bullets: BulletRef[]; onApply: (expId: string, i: number, text: string) => void }) {
  if (bullets.length === 0) return <Empty msg="Add some bullets first." />;
  const flagged = bullets.filter((b) => needsMetric(b.text));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Add measurable impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flagged.length === 0 && (
          <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> All bullets already have a metric.
          </p>
        )}
        {flagged.map((b) => {
          const cat: MetricCategory = detectMetricCategory(b.text);
          const hint = suggestMetricHint(cat);
          return (
            <div key={`${b.expId}-${b.bulletIndex}`} className="rounded-md border bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">💡 {hint}</p>
              <p className="mt-1">{b.text}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => onApply(b.expId, b.bulletIndex, `${b.text} (e.g., ${hint.toLowerCase().replace(/^add a /, "")})`)}
              >
                Insert hint
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AchievementsPanel() {
  const [role, setRole] = useState<AchievementRole>("engineering");
  const picks = useMemo(() => pickTopAchievements(role, 3), [role]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Achievement templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Role</Label>
          <select
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as AchievementRole)}
          >
            {(Object.keys(ACHIEVEMENT_TEMPLATES) as AchievementRole[]).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">
          {picks.map((a, i) => (
            <li key={`${role}-${i}`}>{a}</li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          {ACHIEVEMENT_TEMPLATES[role].length} templates in this category · click "Shuffle" for different picks
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRole((r) => r)}
        >
          Shuffle
        </Button>
      </CardContent>
    </Card>
  );
}

function GrammarPanel({ input, setInput }: { input: string; setInput: (v: string) => void }) {
  const issues = input ? checkGrammar(input) : [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Grammar & style check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text to check…" />
        {input && issues.length === 0 && (
          <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" /> No issues found.
          </p>
        )}
        {issues.length > 0 && (
          <ul className="space-y-1 text-sm">
            {issues.map((i, idx) => (
              <li key={`${i.kind}-${idx}-${i.start}`} className="rounded-md border bg-muted/40 p-2">
                <Badge variant="secondary" className="mr-1.5">{i.kind}</Badge>
                <span className="text-muted-foreground">{i.message}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">{msg}</p>;
}
