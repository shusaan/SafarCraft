"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useArrayField } from "@/hooks/use-array-field";
import { useToast } from "@/components/ui/toast";
import type { ExperienceEntry } from "@/types";
import { Sparkles } from "lucide-react";

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
  const resumeGoal = useResumeStore((s) => s.resumeGoal);
  const { toast } = useToast();
  const [converting, setConverting] = useState<Record<string, number | null>>({});

  const convertToImpact = useCallback(async (entryId: string, bulletIndex: number, text: string) => {
    if (!text.trim()) return;
    setConverting((prev) => ({ ...prev, [`${entryId}-${bulletIndex}`]: null }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "star-convert", content: text, context: resumeGoal }),
      });
      const data = await res.json();
      const improved = data.result ?? text;
      const entry = experience.find((e) => e.id === entryId);
      if (entry) {
        const bullets = [...entry.bullets];
        bullets[bulletIndex] = improved;
        update(entryId, { bullets });
      }
      toast({ title: "Bullet converted to impact", variant: "success" });
    } catch {
      toast({ title: "Conversion failed", description: "Try again later.", variant: "destructive" });
    } finally {
      setConverting((prev) => {
        const next = { ...prev };
        delete next[`${entryId}-${bulletIndex}`];
        return next;
      });
    }
  }, [experience, update, resumeGoal, toast]);

  return (
    <div className="space-y-6">
      {experience.map((entry, index) => (
        <ExperienceEntryCard
          key={entry.id}
          entry={entry}
          index={index}
          onChange={(partial) => update(entry.id, partial)}
          onRemove={() => remove(entry.id)}
          onConvertToImpact={(bulletIndex, text) => convertToImpact(entry.id, bulletIndex, text)}
          isConverting={(key: string) => key in converting}
          entryId={entry.id}
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
  onConvertToImpact,
  isConverting,
  entryId,
}: {
  entry: ExperienceEntry;
  index: number;
  onChange: (partial: Partial<ExperienceEntry>) => void;
  onRemove: () => void;
  onConvertToImpact?: (bulletIndex: number, text: string) => void;
  isConverting?: (key: string) => boolean;
  entryId?: string;
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
            <div className="flex flex-col gap-1 mt-1">
              {onConvertToImpact && bullet.trim() && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => onConvertToImpact(bi, bullet)}
                  disabled={isConverting?.(`${entryId}-${bi}`)}
                  aria-label="Convert to impact using STAR method"
                  title="Convert to Impact (STAR)"
                >
                  {isConverting?.(`${entryId}-${bi}`) ? <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                </Button>
              )}
              {entry.bullets.length > 1 && (
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeBullet(bi)} aria-label="Remove bullet">
                  X
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addBullet}>
          Add Bullet
        </Button>
      </div>
    </div>
  );
}
