"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useResumeStore } from "@/stores/resume-store";
import { calculateQuality, axisColor, axisBg, type AxisScore } from "@/engines/quality/score";
import { cn } from "@/lib/utils";

export function QualityScore() {
  const data = useResumeStore((s) => s.data);
  const result = useMemo(() => calculateQuality(data), [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Resume Quality Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-4xl font-bold tabular-nums", axisColor(result.overall))}>{result.overall}</span>
          <span className="text-sm text-muted-foreground">/ 100 overall</span>
        </div>

        <div className="space-y-3">
          {result.axes.map((axis) => (
            <AxisRow key={axis.key} axis={axis} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AxisRow({ axis }: { axis: AxisScore }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold">{axis.label}</span>
        <span className={cn("tabular-nums font-semibold", axisColor(axis.score))}>{axis.score}/{axis.max}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full transition-all duration-700", axisBg(axis.score))} style={{ width: `${axis.score}%` }} />
      </div>
      {axis.fixes.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {axis.fixes.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
      {axis.fixes.length === 0 && (
        <p className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="h-3 w-3" /> Looks good
        </p>
      )}
    </div>
  );
}
