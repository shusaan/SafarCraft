"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function ContinueDraft() {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("careerforge-resume");
      if (stored) {
        const parsed = JSON.parse(stored);
        const name = parsed?.state?.data?.personal?.name;
        setHasDraft(!!name);
      }
    } catch {
      setHasDraft(false);
    }
  }, []);

  if (!hasDraft) return null;

  return (
    <Link href="/builder">
      <Button variant="outline" size="sm" className="gap-1.5">
        <FileText className="h-4 w-4" />
        Continue Draft
      </Button>
    </Link>
  );
}
