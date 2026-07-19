"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useArrayField } from "@/hooks/use-array-field";
import type { CertificationEntry } from "@/types";

const createCertification = (): Omit<CertificationEntry, "id"> => ({
  name: "",
  issuer: "",
  date: "",
  url: "",
});

export function CertificationsForm() {
  const certifications = useResumeStore((s) => s.data.certifications);
  const updateData = useResumeStore((s) => s.updateData);
  const { add, remove, update } = useArrayField(
    certifications,
    (items) => updateData({ certifications: items }),
    createCertification,
  );

  return (
    <div className="space-y-6">
      {certifications.map((entry, index) => (
        <div key={entry.id} className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Certification #{index + 1}</span>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(entry.id)}>
              Remove
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name</Label>
              <Input value={entry.name} onChange={(e) => update(entry.id, { name: e.target.value })} placeholder="e.g. AWS Solutions Architect" />
            </div>
            <div className="space-y-2">
              <Label>Issuer</Label>
              <Input value={entry.issuer} onChange={(e) => update(entry.id, { issuer: e.target.value })} placeholder="e.g. Amazon Web Services" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input value={entry.date} onChange={(e) => update(entry.id, { date: e.target.value })} placeholder="e.g. 2023" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Credential URL</Label>
              <Input value={entry.url} onChange={(e) => update(entry.id, { url: e.target.value })} placeholder="e.g., https://aws.amazon.com/certification" />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={add}>
        Add Certification
      </Button>
    </div>
  );
}
