"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/stores/resume-store";
import { compareResumes } from "@/engines/ats/comparison";
import { defaultResumeData } from "@/types";
import { GitCompare, ArrowUp, ArrowDown, Plus, Minus } from "lucide-react";

export function VersionComparison() {
  const currentData = useResumeStore((s) => s.data);
  const [versions, setVersions] = useState<Array<{ version: number; data: typeof currentData }>>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const existing = localStorage.getItem("careerforge-autosave");
        if (!existing) return;
        const { id } = JSON.parse(existing);
        if (!id) return;
        const res = await fetch(`/api/resumes/${id}/versions`);
        if (res.ok) {
          const data = await res.json();
          setVersions(data.map((v: { version: number; data: typeof currentData }) => ({
            version: v.version,
            data: v.data,
          })));
        }
      } catch {
        // silently fail
      }
    }
    load();
  }, []);

  const compareVersion = selectedVersion
    ? versions.find((v) => v.version === selectedVersion)
    : null;

  const changes = compareVersion
    ? compareResumes(compareVersion.data, currentData)
    : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <GitCompare className="h-5 w-5" />
          Version Comparison
        </h2>
        <p className="text-sm text-muted-foreground">Compare your current resume against a saved version</p>
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Save a version first to compare. Go to Version History &gt; Save Current Version.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {versions.map((v) => (
            <Button
              key={v.version}
              variant={selectedVersion === v.version ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVersion(v.version)}
            >
              v{v.version}
            </Button>
          ))}
        </div>
      )}

      {changes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Changes detected</h3>
          {changes.map(({ section, diffs }) => (
            <Card key={section}>
              <CardContent className="p-4">
                <h4 className="mb-2 text-sm font-semibold">{section}</h4>
                <ul className="space-y-1">
                  {diffs.map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {d.type === "added" ? (
                        <Plus className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <Minus className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span className={d.type === "added" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                        {d.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedVersion && changes.length === 0 && (
        <p className="text-sm text-muted-foreground">No differences found between versions.</p>
      )}
    </div>
  );
}
