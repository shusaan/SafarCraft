"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { buildCoverLetter } from "@/engines/rewriter/cover-letter";
import { Wand2, Copy, Check, Download } from "lucide-react";

export function CoverLetterGenerator() {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [years, setYears] = useState(0);
  const [highlights, setHighlights] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const text = buildCoverLetter({
      jobTitle,
      company,
      role,
      yearsExperience: years,
      highlights: highlights.split("\n"),
    });
    setResult(text);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company || "draft"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", variant: "success" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Cover Letter Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Senior Software Engineer" />
          </div>
          <div className="space-y-1">
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Acme Inc." />
          </div>
          <div className="space-y-1">
            <Label>Your role/title</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Years of experience</Label>
            <Input type="number" min={0} max={50} value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>3 key highlights (one per line)</Label>
          <Textarea rows={4} value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="Shipped X to 50k users&#10;Reduced p99 latency by 40%&#10;Mentored 4 junior engineers" />
        </div>
        <div className="flex gap-2">
          <Button onClick={generate}>
            <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Generate
          </Button>
          {result && (
            <>
              <Button variant="ghost" size="icon" onClick={copyText} aria-label="Copy">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={download}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download .md
              </Button>
            </>
          )}
        </div>
        {result && (
          <div className="rounded-md border bg-green-50 p-3 text-sm dark:bg-green-950/20">
            <Badge variant="secondary" className="mb-2">Generated cover letter</Badge>
            <pre className="whitespace-pre-wrap font-sans">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
