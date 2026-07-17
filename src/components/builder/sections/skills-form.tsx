"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/stores/resume-store";
import { useArrayField } from "@/hooks/use-array-field";
import type { SkillCategory } from "@/types";

const createCategory = (): Omit<SkillCategory, "id"> => ({
  category: "",
  skills: [],
});

export function SkillsForm() {
  const skills = useResumeStore((s) => s.data.skills);
  const updateData = useResumeStore((s) => s.updateData);
  const { add, remove, update } = useArrayField(skills, (items) => updateData({ skills: items }), createCategory);

  const addSkill = (id: string, skill: string) => {
    const category = skills.find((c) => c.id === id);
    if (category && skill.trim()) {
      update(id, { skills: [...category.skills, skill.trim()] });
    }
  };

  const removeSkill = (id: string, index: number) => {
    const category = skills.find((c) => c.id === id);
    if (category) {
      update(id, { skills: category.skills.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-6">
      {skills.map((category, index) => (
        <div key={category.id} className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Category #{index + 1}</span>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(category.id)}>
              Remove
            </Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={category.category}
                onChange={(e) => update(category.id, { category: e.target.value })}
                placeholder="e.g. Programming Languages, DevOps, Cloud"
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, si) => (
                  <Badge key={si} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(category.id, si)}>
                    {skill} &times;
                  </Badge>
                ))}
              </div>
              <SkillInput onAdd={(skill) => addSkill(category.id, skill)} />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={add}>
        Add Skill Category
      </Button>
    </div>
  );
}

function SkillInput({ onAdd }: { onAdd: (skill: string) => void }) {
  return (
    <Input
      placeholder="Type a skill and press Enter"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onAdd(e.currentTarget.value);
          e.currentTarget.value = "";
        }
      }}
    />
  );
}
