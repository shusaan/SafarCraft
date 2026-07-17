"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useArrayField } from "@/hooks/use-array-field";
import type { ExperienceEntry } from "@/types";

const createExperience = (): Omit<ExperienceEntry, "id"> => ({
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: [""],
  technologies: [],
});

export function ExperienceForm() {
  const experience = useResumeStore((s) => s.data.experience);
  const updateData = useResumeStore((s) => s.updateData);
  const { add, remove, update } = useArrayField(experience, (items) => updateData({ experience: items }), createExperience);

  return (
    <div className="space-y-6">
      {experience.map((entry, index) => (
        <ExperienceEntryCard
          key={entry.id}
          entry={entry}
          index={index}
          onChange={(partial) => update(entry.id, partial)}
          onRemove={() => remove(entry.id)}
        />
      ))}
      <Button variant="outline" className="w-full" onClick={add}>
        Add Experience
      </Button>
    </div>
  );
}

function ExperienceEntryCard({
  entry,
  index,
  onChange,
  onRemove,
}: {
  entry: ExperienceEntry;
  index: number;
  onChange: (partial: Partial<ExperienceEntry>) => void;
  onRemove: () => void;
}) {
  const updateBullet = useCallback(
    (bulletIndex: number, value: string) => {
      const bullets = [...entry.bullets];
      bullets[bulletIndex] = value;
      onChange({ bullets });
    },
    [entry.bullets, onChange],
  );

  const addBullet = useCallback(() => {
    onChange({ bullets: [...entry.bullets, ""] });
  }, [entry.bullets, onChange]);

  const removeBullet = useCallback(
    (bulletIndex: number) => {
      onChange({ bullets: entry.bullets.filter((_, i) => i !== bulletIndex) });
    },
    [entry.bullets, onChange],
  );

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Experience #{index + 1}</span>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Company</Label>
          <Input value={entry.company} onChange={(e) => onChange({ company: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Position</Label>
          <Input value={entry.position} onChange={(e) => onChange({ position: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={entry.location} onChange={(e) => onChange({ location: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input value={entry.startDate} onChange={(e) => onChange({ startDate: e.target.value })} placeholder="e.g. Jan 2020" />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input value={entry.endDate} onChange={(e) => onChange({ endDate: e.target.value })} placeholder="e.g. Dec 2023" disabled={entry.current} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(e) => onChange({ current: e.target.checked, endDate: e.target.checked ? "" : entry.endDate })}
              className="h-4 w-4"
            />
            Currently working here
          </label>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Label>Bullet Points</Label>
        {entry.bullets.map((bullet, bi) => (
          <div key={bi} className="flex gap-2">
            <Textarea
              rows={2}
              value={bullet}
              onChange={(e) => updateBullet(bi, e.target.value)}
              placeholder="Describe your responsibility or achievement..."
            />
            {entry.bullets.length > 1 && (
              <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => removeBullet(bi)}>
                X
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addBullet}>
          Add Bullet
        </Button>
      </div>
    </div>
  );
}
