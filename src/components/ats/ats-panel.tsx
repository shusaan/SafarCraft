"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { calculateATSScore, getATSScoreLabel } from "@/engines/ats/ats-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Lightbulb, XCircle } from "lucide-react";

function getScoreMessage(score: number): string {
  if (score >= 90) return "Excellent! Your resume is optimized for ATS systems.";
  if (score >= 70) return "Good foundation — 3 quick fixes could get you to 85+.";
  if (score >= 50) return "Needs improvement — focus on keywords and formatting.";
  return "Significant issues — let's fix the basics first.";
}

export function ATSPanel() {
  const data = useResumeStore((s) => s.data);
  const result = useMemo(() => calculateATSScore(data), [data]);
  const { label, color } = getATSScoreLabel(result.score);

  const severityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">ATS Analysis</h2>
        <p className="text-sm text-muted-foreground">How well your resume performs with ATS systems</p>
      </div>

      <Card className="text-center">
        <CardContent className="pt-6">
          <div
            className="text-5xl font-bold"
            style={{
              color: result.score >= 80 ? "#16a34a" : result.score >= 60 ? "#ca8a04" : result.score >= 40 ? "#ea580c" : "#dc2626",
            }}
          >
            {result.score}
          </div>
          <p className={`mt-1 text-sm font-medium ${color}`}>{label}</p>
          <p className="mt-2 text-xs text-muted-foreground">{getScoreMessage(result.score)}</p>
        </CardContent>
      </Card>

      {result.deductions.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <XCircle className="h-4 w-4 text-destructive" />
            Deductions ({result.deductions.length})
          </h3>
          {result.deductions.map((d, i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-3 p-3">
                <Badge variant={severityColor(d.severity)} className="mt-0.5 shrink-0">{d.points}pts</Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{d.category}</p>
                  <p className="text-xs text-muted-foreground">{d.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.deductions.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <p className="text-sm text-muted-foreground">No issues found! Your resume is ATS-ready.</p>
        </div>
      )}
    </div>
  );
}
