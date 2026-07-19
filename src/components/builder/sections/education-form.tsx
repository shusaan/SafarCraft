"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useArrayField } from "@/hooks/use-array-field";
import type { EducationEntry } from "@/types";

const createEducation = (): Omit<EducationEntry, "id"> => ({
  institution: "",
  degree: "",
  field: "",
  location: "",
  startDate: "",
  endDate: "",
  gpa: "",
  honors: [],
});

export function EducationForm() {
  const education = useResumeStore((s) => s.data.education);
  const updateData = useResumeStore((s) => s.updateData);
  const { add, remove, update } = useArrayField(education, (items) => updateData({ education: items }), createEducation);

  return (
    <div className="space-y-6">
      {education.map((entry, index) => (
        <div key={entry.id} className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Education #{index + 1}</span>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(entry.id)}>
              Remove
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Institution</Label>
              <Input value={entry.institution} onChange={(e) => update(entry.id, { institution: e.target.value })} placeholder="e.g., University of California, Berkeley" />
            </div>
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input value={entry.degree} onChange={(e) => update(entry.id, { degree: e.target.value })} placeholder="e.g. Bachelor of Science" />
            </div>
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <Input value={entry.field} onChange={(e) => update(entry.id, { field: e.target.value })} placeholder="e.g. Computer Science" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={entry.location} onChange={(e) => update(entry.id, { location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>GPA</Label>
              <Input value={entry.gpa} onChange={(e) => update(entry.id, { gpa: e.target.value })} placeholder="e.g. 3.8/4.0" />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input value={entry.startDate} onChange={(e) => update(entry.id, { startDate: e.target.value })} placeholder="e.g. Sep 2016" />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input value={entry.endDate} onChange={(e) => update(entry.id, { endDate: e.target.value })} placeholder="e.g. Jun 2020" />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={add}>
        Add Education
      </Button>
    </div>
  );
}
