"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/stores/resume-store";
import { tailorToJD } from "@/engines/jd-tailor/tailor";
import { Wand2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function JDTailorMode() {
  const data = useResumeStore((s) => s.data);
  const [jdText, setJdText] = useState("");

  const result = useMemo(() => (jdText.trim() ? tailorToJD(jdText, data) : null), [jdText, data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">JD Tailoring Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Paste a job description</Label>
          <Textarea
            rows={6}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the JD here to see matched / missing keywords and rephrasing suggestions…"
          />
        </div>

        {result && (
          <>
            <div className="flex items-center gap-2 rounded-md border bg-card p-3">
              <div className="text-2xl font-bold tabular-nums">{result.matchScore}</div>
              <div className="text-xs text-muted-foreground">% keyword match</div>
            </div>

            {result.matched.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Matched keywords ({result.matched.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched.map((kw) => (
                    <Badge key={kw} variant="secondary">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.missing.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                  <XCircle className="h-3.5 w-3.5" /> Missing keywords ({result.missing.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing.map((kw) => (
                    <Badge key={kw} variant="destructive">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.rephraseSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" /> Rephrasing suggestions
                </p>
                <ul className="space-y-1.5 text-xs">
                  {result.rephraseSuggestions.map((s, i) => (
                    <li key={i} className="rounded-md border bg-muted/40 p-2">
                      Replace <code className="rounded bg-background px-1">{s.resumeKeyword}</code> with{" "}
                      <code className="rounded bg-background px-1">{s.jdKeyword}</code>
                      {s.bullet && <span className="block text-muted-foreground">in: {s.bullet}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!result && (
          <p className="text-xs text-muted-foreground">
            <Wand2 className="mr-1 inline h-3 w-3" />
            Paste a JD to compare against your resume.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
