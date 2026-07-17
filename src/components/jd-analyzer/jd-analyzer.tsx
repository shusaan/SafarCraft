"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/stores/resume-store";
import { analyzeJobDescription } from "@/engines/ats/jd-analyzer";
import { Target, CheckCircle, XCircle, Lightbulb, TrendingUp, Activity } from "lucide-react";
import type { JDParseResult } from "@/types";

export function JDAnalyzer() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<JDParseResult | null>(null);
  const data = useResumeStore((s) => s.data);

  const handleAnalyze = () => {
    if (!jd.trim()) return;
    const analysis = analyzeJobDescription(jd, data);
    setResult(analysis);
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Target className="h-5 w-5" />
          Job Description Analyzer
        </h2>
        <p className="text-sm text-muted-foreground">Compare your resume against any job description</p>
      </div>

      <div className="space-y-2">
        <Textarea
          rows={8}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste a job description here..."
        />
        <Button onClick={handleAnalyze} disabled={!jd.trim()} className="w-full">
          <TrendingUp className="mr-2 h-4 w-4" />
          Analyze Match
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${scoreColor(result.matchScore)}`}>
                  {result.matchScore}%
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Resume Match Score</p>
              </div>
            </CardContent>
          </Card>

          {result.missingSkills.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <XCircle className="h-4 w-4 text-destructive" />
                Missing Skills ({result.missingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {result.missingSkills.map((skill) => (
                  <Badge key={skill} variant="destructive">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {result.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Detected Skills ({result.skills.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {result.skills.map((skill) => (
                  <Badge key={skill} variant={result.missingSkills.includes(skill) ? "destructive" : "success"}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Suggestions
              </h3>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(result.keywordHeatmap).length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-blue-500" />
                Keyword Frequency
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.keywordHeatmap)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 20)
                  .map(([keyword, count]) => {
                    const intensity = Math.min(count / 5, 1);
                    const bg = intensity > 0.7 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : intensity > 0.4 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      : "bg-muted text-muted-foreground";
                    return (
                      <span key={keyword} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${bg}`}
                        style={{ opacity: 0.5 + intensity * 0.5 }}
                      >
                        {keyword}
                        <span className="text-[10px] opacity-60">x{count}</span>
                      </span>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Experience Level: <span className="font-medium text-foreground">{result.experienceLevel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
