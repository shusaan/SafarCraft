"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/stores/resume-store";
import { computeInsights } from "@/engines/analytics/insights";
import { BarChart3, TrendingUp, Hash, AlertTriangle } from "lucide-react";

export function InsightsDashboard() {
  const data = useResumeStore((s) => s.data);
  const insights = useMemo(() => computeInsights(data), [data]);

  const numericPct = insights.totalBullets > 0
    ? Math.round((insights.bulletsWithNumbers / insights.totalBullets) * 100)
    : 0;
  const weakPct = insights.totalBullets > 0
    ? Math.round((insights.bulletsWithWeakVerbs / insights.totalBullets) * 100)
    : 0;

  const topVerbs = Object.entries(insights.verbsByFirstWord)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxBucket = Math.max(...insights.bulletLengthBuckets.map((b) => b.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Insights Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={BarChart3} label="Total bullets" value={insights.totalBullets} />
          <Stat icon={TrendingUp} label="Avg length" value={`${insights.avgBulletLength}c`} />
          <Stat icon={Hash} label="With numbers" value={`${numericPct}%`} />
          <Stat icon={AlertTriangle} label="Weak verbs" value={`${weakPct}%`} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold">Bullet length distribution</p>
          <div className="space-y-1.5">
            {insights.bulletLengthBuckets.map((b) => (
              <div key={b.bucket} className="flex items-center gap-2 text-xs">
                <span className="w-12 text-muted-foreground">{b.bucket}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(b.count / maxBucket) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right tabular-nums">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        {topVerbs.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold">Top starting verbs</p>
            <div className="flex flex-wrap gap-1.5">
              {topVerbs.map(([verb, n]) => (
                <Badge key={verb} variant="secondary">
                  {verb} × {n}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold">Sections</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-3">
            {Object.entries(insights.sectionCounts).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-md border bg-card p-2">
                <span className="capitalize text-muted-foreground">{k}</span>
                <span className="font-semibold tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="rounded-md border bg-card p-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}
