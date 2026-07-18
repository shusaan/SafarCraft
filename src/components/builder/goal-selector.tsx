"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useResumeStore, type ResumeGoal } from "@/stores/resume-store";
import { Target } from "lucide-react";

const goals: Array<{ id: ResumeGoal; label: string; hint: string }> = [
  { id: "startup",    label: "Tech Startup",   hint: "Emphasize impact, ownership, and breadth of skills" },
  { id: "faang",      label: "FAANG / Big Tech", hint: "Emphasize algorithmic complexity, scale, and systems" },
  { id: "government", label: "Government",      hint: "Emphasize compliance, process, and clear documentation" },
  { id: "academia",   label: "Academia",        hint: "Emphasize publications, grants, and teaching" },
];

export function GoalSelector() {
  const resumeGoal = useResumeStore((s) => s.resumeGoal);
  const setResumeGoal = useResumeStore((s) => s.setResumeGoal);
  const current = goals.find((g) => g.id === resumeGoal);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/10">
      <Target className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Label className="text-xs font-medium text-muted-foreground shrink-0">Applying to:</Label>
      <Select value={resumeGoal} onValueChange={(v) => setResumeGoal(v as ResumeGoal)}>
        <SelectTrigger className="h-7 w-40 text-xs border-0 bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-ring px-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {goals.map((g) => (
            <SelectItem key={g.id} value={g.id} className="text-xs">{g.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {current && (
        <p className="hidden sm:block text-[10px] text-muted-foreground/60 italic" aria-live="polite">
          {current.hint}
        </p>
      )}
    </div>
  );
}
