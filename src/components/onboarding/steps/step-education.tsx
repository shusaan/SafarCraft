"use client";

// Step 3 — Education. Repeating entry: degree, field, institution,
// dates, optional GPA.

import { useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useResumeStore } from "@/stores/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function StepEducation() {
  const education = useResumeStore((s) => s.data.education);
  const updateData = useResumeStore((s) => s.updateData);

  const updateEducation = useCallback(
    (next: typeof education) => updateData({ education: next }),
    [updateData],
  );

  const add = useCallback(() => {
    updateEducation([
      ...education,
      {
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        institution: "",
        degree: "",
        field: "",
        location: "",
        startDate: "",
        endDate: "",
        gpa: "",
        honors: [],
      },
    ]);
  }, [education, updateEducation]);

  const remove = useCallback(
    (id: string) => updateEducation(education.filter((e) => e.id !== id)),
    [education, updateEducation],
  );

  const patch = useCallback(
    (id: string, partial: Partial<(typeof education)[number]>) =>
      updateEducation(education.map((e) => (e.id === id ? { ...e, ...partial } : e))),
    [education, updateEducation],
  );

  return (
    <div className="space-y-5" aria-label="Education">
      {education.length === 0 ? (
        <EmptyHint onAdd={add} />
      ) : (
        education.map((edu, i) => (
          <EntryCard
            key={edu.id}
            index={i + 1}
            entry={edu}
            onPatch={(p) => patch(edu.id, p)}
            onRemove={() => remove(edu.id)}
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
        Add another school
      </Button>
    </div>
  );
}

function EmptyHint({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center">
      <p className="text-sm text-muted-foreground">No schools yet — add your most recent degree first.</p>
      <Button variant="outline" onClick={onAdd} className="mt-3 gap-1.5">
        <Plus className="h-4 w-4" />
        Add first school
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
  entry: (typeof useResumeStore extends never ? never : import("@/types").EducationEntry);
  onPatch: (p: Partial<import("@/types").EducationEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          School #{index}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove school ${index}`}
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Labeled id={`edu-inst-${entry.id}`} label="Institution">
          <Input
            id={`edu-inst-${entry.id}`}
            value={entry.institution}
            onChange={(e) => onPatch({ institution: e.target.value })}
            placeholder="MIT"
          />
        </Labeled>
        <Labeled id={`edu-loc-${entry.id}`} label="Location">
          <Input
            id={`edu-loc-${entry.id}`}
            value={entry.location}
            onChange={(e) => onPatch({ location: e.target.value })}
            placeholder="Cambridge, MA"
          />
        </Labeled>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Labeled id={`edu-deg-${entry.id}`} label="Degree">
          <Input
            id={`edu-deg-${entry.id}`}
            value={entry.degree}
            onChange={(e) => onPatch({ degree: e.target.value })}
            placeholder="BSc"
          />
        </Labeled>
        <Labeled id={`edu-field-${entry.id}`} label="Field of study">
          <Input
            id={`edu-field-${entry.id}`}
            value={entry.field}
            onChange={(e) => onPatch({ field: e.target.value })}
            placeholder="Computer Science"
          />
        </Labeled>
        <Labeled id={`edu-gpa-${entry.id}`} label="GPA (optional)">
          <Input
            id={`edu-gpa-${entry.id}`}
            value={entry.gpa}
            onChange={(e) => onPatch({ gpa: e.target.value })}
            placeholder="3.8"
          />
        </Labeled>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Labeled id={`edu-start-${entry.id}`} label="Start (YYYY)">
          <Input
            id={`edu-start-${entry.id}`}
            value={entry.startDate}
            onChange={(e) => onPatch({ startDate: e.target.value })}
            placeholder="2018"
          />
        </Labeled>
        <Labeled id={`edu-end-${entry.id}`} label="End (YYYY or 'Present')">
          <Input
            id={`edu-end-${entry.id}`}
            value={entry.endDate}
            onChange={(e) => onPatch({ endDate: e.target.value })}
            placeholder="2022"
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