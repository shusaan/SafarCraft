"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Cloud } from "lucide-react";

export function ContinueDraft() {
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [hasDriveDraft, setHasDriveDraft] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("careerforge-resume");
      if (stored) {
        const parsed = JSON.parse(stored);
        const name = parsed?.state?.data?.personal?.name;
        setHasLocalDraft(!!name);
      }
    } catch {
      setHasLocalDraft(false);
    }

    // Check Google Drive for existing drafts (if client ID is configured)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: async (response) => {
          if (!response.access_token) return;
          try {
            const res = await fetch(
              "https://www.googleapis.com/drive/v3/files?" +
                new URLSearchParams({
                  q: "name contains 'Application_Package'",
                  fields: "files(id,name)",
                  pageSize: "1",
                }),
              { headers: { Authorization: `Bearer ${response.access_token}` } },
            );
            const data = await res.json();
            if (data.files?.length > 0) setHasDriveDraft(true);
          } catch {
            // Silently fail
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: "none" });
    } catch {
      // GIS not loaded or no token available
    }
  }, []);

  if (!hasLocalDraft && !hasDriveDraft) return null;

  return (
    <Link href="/builder">
      <Button variant="outline" size="sm" className="gap-1.5">
        {hasDriveDraft ? <Cloud className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        Continue Draft
        {hasDriveDraft && <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">Drive</span>}
      </Button>
    </Link>
  );
}
