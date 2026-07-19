"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useArrayField } from "@/hooks/use-array-field";
import type { ProjectEntry } from "@/types";

const createProject = (): Omit<ProjectEntry, "id"> => ({
  name: "",
  role: "",
  description: "",
  technologies: [],
  url: "",
  highlights: [""],
});

export function ProjectsForm() {
  const projects = useResumeStore((s) => s.data.projects);
  const updateData = useResumeStore((s) => s.updateData);
  const { add, remove, update } = useArrayField(projects, (items) => updateData({ projects: items }), createProject);

  return (
    <div className="space-y-6">
      {projects.map((entry, index) => (
        <ProjectCard
          key={entry.id}
          entry={entry}
          index={index}
          onChange={(partial) => update(entry.id, partial)}
          onRemove={() => remove(entry.id)}
        />
      ))}
      <Button variant="outline" className="w-full" onClick={add}>
        Add Project
      </Button>
    </div>
  );
}

function ProjectCard({
  entry,
  index,
  onChange,
  onRemove,
}: {
  entry: ProjectEntry;
  index: number;
  onChange: (partial: Partial<ProjectEntry>) => void;
  onRemove: () => void;
}) {
  const updateHighlight = useCallback(
    (hi: number, value: string) => {
      const highlights = [...entry.highlights];
      highlights[hi] = value;
      onChange({ highlights });
    },
    [entry.highlights, onChange],
  );

  const addHighlight = useCallback(() => {
    onChange({ highlights: [...entry.highlights, ""] });
  }, [entry.highlights, onChange]);

  const removeHighlight = useCallback(
    (hi: number) => {
      onChange({ highlights: entry.highlights.filter((_, i) => i !== hi) });
    },
    [entry.highlights, onChange],
  );

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Project #{index + 1}</span>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Project Name</Label>
          <Input value={entry.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g., Open Source Resume Builder" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={entry.role} onChange={(e) => onChange({ role: e.target.value })} placeholder="e.g., Creator, Maintainer" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Textarea rows={2} value={entry.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="e.g., AI-powered resume builder for software engineers with ATS optimization" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Project URL</Label>
          <Input value={entry.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="e.g., github.com/username/project" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Label>Highlights</Label>
        {entry.highlights.map((h, hi) => (
          <div key={hi} className="flex gap-2">
            <Textarea
              rows={1}
              value={h}
              onChange={(e) => updateHighlight(hi, e.target.value)}
              placeholder="Project highlight or achievement..."
            />
            {entry.highlights.length > 1 && (
              <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => removeHighlight(hi)}>
                X
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addHighlight}>
          Add Highlight
        </Button>
      </div>
    </div>
  );
}
