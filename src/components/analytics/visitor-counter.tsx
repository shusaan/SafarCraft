"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/ui-store";
import { Eye } from "lucide-react";

export function VisitorCounter() {
  const visitorCount = useUIStore((s) => s.visitorCount);
  const setVisitorCount = useUIStore((s) => s.setVisitorCount);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simple local counter — in production, replace with Cloudflare Worker
    const stored = localStorage.getItem("careerforge-visits");
    const count = stored ? parseInt(stored, 10) + 1 : 1;
    localStorage.setItem("careerforge-visits", String(count));
    setVisitorCount(count);
    setLoaded(true);
  }, [setVisitorCount]);

  if (!loaded) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
      <Eye className="h-3 w-3" />
      <span>{visitorCount.toLocaleString()} visitors</span>
    </div>
  );
}
