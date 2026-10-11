"use client";

// Step 2 — Experience. Repeating entry: position, company, location,
// start date, end date (or "Current"), bullets, technologies.

import { useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useResumeStore } from "@/stores/resume-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function StepExperience() {
  const experience = useResumeStore((s) => s.data.experience);
  const updateData = useResumeStore((s) => s.updateData);

  const updateExperience = useCallback(
    (next: typeof experience) => updateData({ experience: next }),
    [updateData],
  );

  const add = useCallback(() => {
    updateExperience([
      ...experience,
      {
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        bullets: [],
        technologies: [],
      },
    ]);
  }, [experience, updateExperience]);

  const remove = useCallback(
    (id: string) => updateExperience(experience.filter((e) => e.id !== id)),
    [experience, updateExperience],
  );

  const patch = useCallback(
    (id: string, partial: Partial<(typeof experience)[number]>) =>
      updateExperience(experience.map((e) => (e.id === id ? { ...e, ...partial } : e))),
    [experience, updateExperience],
  );

  return (
    <div className="space-y-5" aria-label="Work experience">
      {experience.length === 0 ? (
        <EmptyHint onAdd={add} />
      ) : (
        experience.map((exp, i) => (
          <EntryCard
            key={exp.id}
            index={i + 1}
            entry={exp}
            onPatch={(p) => patch(exp.id, p)}
            onRemove={() => remove(exp.id)}
          />
        ))
      )}
      <Button
        variant="outline"
        onClick={add}
        className="w-full gap-1.5"
        type="button"
      >
        <Plus className="h-4 w-4" />
        Add another role
      </Button>
    </div>
  );
}

function EmptyHint({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center">
      <p className="text-sm text-muted-foreground">No roles yet — add your most recent position first.</p>
      <Button variant="outline" onClick={onAdd} className="mt-3 gap-1.5">
        <Plus className="h-4 w-4" />
        Add first role
      </Button>
    </div>
  );
}

function EntryCard({
  index,
  entry,
  onPatch,
  onRemove,
}: {
  index: number;
  entry: (typeof useResumeStore extends never ? never : import("@/types").ExperienceEntry);
  onPatch: (p: Partial<import("@/types").ExperienceEntry>) => void;
  onRemove: () => void;
}) {
  const bulletsText = (entry.bullets ?? []).join("\n");
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Role #{index}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove role ${index}`}
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Labeled id={`exp-pos-${entry.id}`} label="Position">
          <Input
            id={`exp-pos-${entry.id}`}
            value={entry.position}
            onChange={(e) => onPatch({ position: e.target.value })}
            placeholder="Senior Software Engineer"
          />
        </Labeled>
        <Labeled id={`exp-co-${entry.id}`} label="Company">
          <Input
            id={`exp-co-${entry.id}`}
            value={entry.company}
            onChange={(e) => onPatch({ company: e.target.value })}
            placeholder="Acme Corp"
          />
        </Labeled>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Labeled id={`exp-loc-${entry.id}`} label="Location">
          <Input
            id={`exp-loc-${entry.id}`}
            value={entry.location}
            onChange={(e) => onPatch({ location: e.target.value })}
            placeholder="Remote"
          />
        </Labeled>
        <Labeled id={`exp-start-${entry.id}`} label="Start (YYYY-MM)">
          <Input
            id={`exp-start-${entry.id}`}
            value={entry.startDate}
            onChange={(e) => onPatch({ startDate: e.target.value })}
            placeholder="2022-01"
          />
        </Labeled>
        <div className="space-y-1.5">
          <Labeled id={`exp-end-${entry.id}`} label="End (YYYY-MM)">
            <Input
              id={`exp-end-${entry.id}`}
              value={entry.current ? "" : entry.endDate}
              onChange={(e) => onPatch({ endDate: e.target.value, current: false })}
              placeholder="2025-06"
              disabled={entry.current}
              className={cn(entry.current && "opacity-60")}
            />
          </Labeled>
          <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={entry.current}
              onCheckedChange={(c: boolean) => onPatch({ current: c, endDate: c ? "" : entry.endDate })}
              aria-label="Currently in this role"
            />
            Currently in this role
          </label>
        </div>
      </div>

      <div className="mt-3">
        <Labeled id={`exp-bullets-${entry.id}`} label="Highlights (one per line)">
          <Textarea
            id={`exp-bullets-${entry.id}`}
            rows={4}
            value={bulletsText}
            onChange={(e) =>
              onPatch({
                bullets: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Led a team of 5 engineers&#10;Reduced API latency by 40%&#10;Shipped v2 to 1M users"
          />
        </Labeled>
      </div>
    </div>
  );
}

function Labeled({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
      </Label>
      {children}
    </div>
  );
}