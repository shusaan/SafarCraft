"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useToast } from "@/components/ui/toast";
import type { ResumeData } from "@/types";
import { Clock, RotateCcw, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Version = {
  id: string;
  resumeId: string;
  version: number;
  createdAt: string;
  atsScore: number | null;
  data: ResumeData;
};

export function VersionHistory() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const updateData = useResumeStore((s) => s.updateData);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, []);

  async function loadVersions() {
    try {
      const existing = localStorage.getItem("careerforge-autosave");
      if (!existing) return;
      const { id } = JSON.parse(existing);
      if (!id) return;
      const res = await fetch(`/api/resumes/${id}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  const saveVersion = async () => {
    const existing = localStorage.getItem("careerforge-autosave");
    if (!existing) return;
    const { id } = JSON.parse(existing);
    if (!id) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "POST" });
      if (res.ok) {
        const version = await res.json();
        setVersions((prev) => [version, ...prev]);
        toast({ title: "Version saved", variant: "success" });
      }
    } catch {
      toast({ title: "Failed to save version", variant: "destructive" });
    }
  };

  const restoreVersion = (v: Version) => {
    updateData(v.data);
    toast({ title: `Restored version ${v.version}`, variant: "success" });
  };

  if (loading) {
    return (
      <div className="space-y-2 py-4" aria-label="Loading versions">
        <Skeleton className="h-9 w-full rounded-md" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={saveVersion} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Current Version
      </Button>

      <div className="max-h-64 space-y-1 overflow-y-auto">
        {versions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No versions saved yet.</p>
        ) : (
          versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Version {v.version}</span>
                {v.atsScore !== null && (
                  <span className="text-xs text-muted-foreground">ATS: {v.atsScore}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(v.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => restoreVersion(v)}
                title="Restore this version"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
