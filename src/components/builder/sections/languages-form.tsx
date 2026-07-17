"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResumeStore } from "@/stores/resume-store";
import { useArrayField } from "@/hooks/use-array-field";
import type { LanguageEntry } from "@/types";

const proficiencies = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

const createLanguage = (): Omit<LanguageEntry, "id"> => ({
  language: "",
  proficiency: "Intermediate",
});

export function LanguagesForm() {
  const languages = useResumeStore((s) => s.data.languages);
  const updateData = useResumeStore((s) => s.updateData);
  const { add, remove, update } = useArrayField(
    languages,
    (items) => updateData({ languages: items }),
    createLanguage,
  );

  return (
    <div className="space-y-4">
      {languages.map((entry, _index) => (
        <div key={entry.id} className="flex items-end gap-4 rounded-lg border p-4">
          <div className="flex-1 space-y-2">
            <Label>Language</Label>
            <Input value={entry.language} onChange={(e) => update(entry.id, { language: e.target.value })} placeholder="e.g. English" />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Proficiency</Label>
            <Select value={entry.proficiency} onValueChange={(v) => update(entry.id, { proficiency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {proficiencies.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(entry.id)}>
            X
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={add}>
        Add Language
      </Button>
    </div>
  );
}
