"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { tailorToJD } from "@/engines/jd-tailor/tailor";
import { planTailoring, type TailoringPlan, type TailoringChange } from "@/engines/ats/jd-tailoring";
import { useToast } from "@/components/ui/toast";
import {
  Wand2, CheckCircle2, XCircle, AlertCircle, Plus, ArrowUp, ListOrdered, Sparkles,
} from "lucide-react";

export function JDTailorMode() {
  const data = useResumeStore((s) => s.data);
  const updateData = useResumeStore((s) => s.updateData);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);
  const updateSkills = useResumeStore((s) => s.updateSkills);
  const { toast } = useToast();

  const [jdText, setJdText] = useState("");
  const [appliedChanges, setAppliedChanges] = useState<Set<number>>(new Set());

  const result = useMemo(() => (jdText.trim() ? tailorToJD(jdText, data) : null), [jdText, data]);
  const plan: TailoringPlan | null = useMemo(
    () => (jdText.trim() ? planTailoring(jdText, data) : null),
    [jdText, data],
  );

  const applyChange = (idx: number, change: TailoringChange) => {
    if (change.kind === "add-bullet") {
      // Append to the most recent experience entry
      const latest = data.experience[0];
      if (!latest) {
        toast({ title: "Add an experience entry first", variant: "destructive" });
        return;
      }
      const updated = data.experience.map((e) =>
        e.id === latest.id
          ? { ...e, bullets: [change.after, ...e.bullets.filter(Boolean)] }
          : e,
      );
      updateData({ experience: updated });
      setAppliedChanges((prev) => new Set(prev).add(idx));
      toast({ title: "Bullet added", variant: "success" });
      return;
    }

    if (change.kind === "reorder-skills") {
      // Move skill categories whose name appears in jdKeywords to the top
      const jdLower = jdText.toLowerCase();
      const sorted = [...data.skills].sort((a, b) => {
        const aHit = a.skills.some((s) => jdLower.includes(s.toLowerCase())) ? 1 : 0;
        const bHit = b.skills.some((s) => jdLower.includes(s.toLowerCase())) ? 1 : 0;
        return bHit - aHit;
      });
      updateSkills(sorted);
      setAppliedChanges((prev) => new Set(prev).add(idx));
      toast({ title: "Skills reordered", variant: "success" });
      return;
    }

    if (change.kind === "summary") {
      updatePersonal({ summary: change.after });
      setAppliedChanges((prev) => new Set(prev).add(idx));
      toast({ title: "Summary draft applied", variant: "success" });
      return;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wand2 className="h-4 w-4 text-primary" />
          JD Tailoring Mode
          <Badge variant="secondary" className="ml-auto text-[10px]">Local · No AI key</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Paste a job description</Label>
          <Textarea
            rows={6}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the JD here to see matched / missing keywords, rephrasing suggestions, and one-click resume tailoring…"
          />
        </div>

        {result && plan && (
          <>
            <div className="flex items-center gap-2 rounded-md border bg-card p-3">
              <div className="text-2xl font-bold tabular-nums">{result.matchScore}</div>
              <div className="text-xs text-muted-foreground">% keyword match</div>
              <div className="ml-auto text-right text-xs">
                <p className="font-medium">{plan.domains.slice(0, 2).join(" + ") || "general"}</p>
                <p className="text-muted-foreground">detected domain</p>
              </div>
            </div>

            {result.matched.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Matched keywords ({result.matched.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched.map((kw) => (
                    <Badge key={kw} variant="secondary">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.missing.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <XCircle className="h-3.5 w-3.5" /> Missing keywords ({result.missing.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing.map((kw) => (
                    <Badge key={kw} variant="destructive">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.rephraseSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" /> Rephrasing suggestions
                </p>
                <ul className="space-y-1.5 text-xs">
                  {result.rephraseSuggestions.map((s, i) => (
                    <li key={i} className="rounded-md border bg-muted/40 p-2">
                      Replace <code className="rounded bg-background px-1">{s.resumeKeyword}</code> with{" "}
                      <code className="rounded bg-background px-1">{s.jdKeyword}</code>
                      {s.bullet && <span className="block text-muted-foreground">in: {s.bullet}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* One-click tailoring actions */}
            <div className="space-y-2 border-t pt-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                One-click tailoring
              </p>

              {plan.summarySuggestion && (
                <div className="rounded-md border bg-card p-2.5 text-xs">
                  <p className="mb-1.5 font-medium">Suggested summary</p>
                  <p className="rounded bg-muted/40 p-2 italic">{plan.summarySuggestion}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-6 gap-1 text-[10px]"
                    onClick={() =>
                      applyChange(-1, {
                        kind: "summary",
                        path: "personal.summary",
                        after: plan.summarySuggestion,
                        reason: "Draft summary",
                        confidence: 0.4,
                      })
                    }
                  >
                    <Plus className="h-3 w-3" />
                    Use as summary draft
                  </Button>
                </div>
              )}

              {plan.changes.filter((c) => c.kind === "reorder-skills").map((c, i) => (
                <Button
                  key={`reorder-${i}`}
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => applyChange(i, c)}
                >
                  <ListOrdered className="h-3 w-3" />
                  Reorder skills to match the JD
                </Button>
              ))}

              {plan.changes
                .filter((c) => c.kind === "add-bullet")
                .slice(0, 1)
                .map((c, i) => (
                  <div key={`add-${i}`} className="rounded-md border bg-card p-2.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested bullet</p>
                    <p className="text-xs italic">{c.after}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{c.reason}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-6 gap-1 text-[10px]"
                      onClick={() => applyChange(100, c)}
                    >
                      <Plus className="h-3 w-3" />
                      Add to latest role
                    </Button>
                  </div>
                ))}

              {plan.changes.filter((c) => c.kind === "rewrite-bullet").length > 0 && (
                <div className="space-y-1.5 rounded-md border bg-card p-2.5 text-xs">
                  <p className="font-medium">Bullets to surface (move higher)</p>
                  {plan.changes
                    .filter((c) => c.kind === "rewrite-bullet")
                    .slice(0, 4)
                    .map((c, i) => (
                      <div key={`b-${i}`} className="flex items-start gap-1.5 text-muted-foreground">
                        <ArrowUp className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="italic">"{c.before}"</span>
                      </div>
                    ))}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Tip: drag these to the top of their role in the Experience panel.
                  </p>
                </div>
              )}

              {appliedChanges.size > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  ✓ {appliedChanges.size} change{appliedChanges.size === 1 ? "" : "s"} applied. Re-run the JD to re-suggest after edits.
                </p>
              )}
            </div>
          </>
        )}

        {!result && (
          <p className="text-xs text-muted-foreground">
            <Wand2 className="mr-1 inline h-3 w-3" />
            Paste a JD to compare against your resume.
          </p>
        )}
      </CardContent>
    </Card>
  );
}