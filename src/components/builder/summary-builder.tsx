"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useResumeStore } from "@/stores/resume-store";
import { buildSummary, type SummaryInput } from "@/engines/rewriter/summary-builder";
import { Wand2, Copy, Check } from "lucide-react";

export function SummaryBuilder() {
  const data = useResumeStore((s) => s.data);
  const updateData = useResumeStore((s) => s.updateData);
  const { toast } = useToast();
  const [role, setRole] = useState("");
  const [years, setYears] = useState(0);
  const [skills, setSkills] = useState("");
  const [target, setTarget] = useState<SummaryInput["targetType"]>("startup");
  const [highlights, setHighlights] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const summary = buildSummary({
      role: role || data.personal.summary?.split(".")[0] || "Software Engineer",
      yearsExperience: years,
      topSkills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      targetType: target,
      highlights: highlights.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    setResult(summary);
  };

  const applyToResume = () => {
    updateData({
      personal: { ...data.personal, summary: result },
    });
    toast({ title: "Summary applied to your resume", variant: "success" });
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Summary Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Role / Title</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Senior Backend Engineer" />
          </div>
          <div className="space-y-1">
            <Label>Years of experience</Label>
            <Input type="number" min={0} max={50} value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Top 3 skills (comma-separated)</Label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g., TypeScript, distributed systems, PostgreSQL" />
        </div>
        <div className="space-y-1">
          <Label>Target company type</Label>
          <select
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            value={target}
            onChange={(e) => setTarget(e.target.value as SummaryInput["targetType"])}
          >
            <option value="startup">Startup</option>
            <option value="faang">FAANG / Big Tech</option>
            <option value="government">Government</option>
            <option value="academia">Academia</option>
            <option value="general">General</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Highlights (one per line, optional)</Label>
          <Textarea rows={3} value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Shipped X to 50k users&#10;Reduced p99 by 40%" />
        </div>
        <div className="flex gap-2">
          <Button onClick={generate}>
            <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Generate
          </Button>
          {result && (
            <>
              <Button variant="outline" onClick={applyToResume}>
                Apply to resume
              </Button>
              <Button variant="ghost" size="icon" onClick={copyText} aria-label="Copy summary">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
        {result && (
          <div className="rounded-md border bg-green-50 p-3 text-sm dark:bg-green-950/20">
            <Badge variant="secondary" className="mb-2">Generated</Badge>
            <p>{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
