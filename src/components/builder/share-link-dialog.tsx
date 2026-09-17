"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/stores/resume-store";
import { useToast } from "@/components/ui/toast";
import { buildShareUrl, encodeResume } from "@/engines/share/encode";
import { Link2, Copy, ExternalLink, Check } from "lucide-react";

export function ShareLinkDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const data = useResumeStore((s) => s.data);
  const layout = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate the share URL on demand (only when dialog is open, to keep things responsive)
  const origin = typeof window !== "undefined" ? window.location.origin : "https://careerforge.app";
  const shareUrl = open ? buildShareUrl(origin, { data, layout, template }) : "";

  const sizeKB = (new Blob([encodeResume({ data, layout, template })]).size / 1024).toFixed(1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Share link copied", description: "Anyone with this link can view your resume." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  };

  const handleOpen = () => {
    if (typeof window !== "undefined") window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Share resume
          </DialogTitle>
          <DialogDescription>
            Generate a public URL for this resume. Free tier uses a self-contained link — your data stays yours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Public URL</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleOpen} aria-label="Open share link in a new tab">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              URL size: {sizeKB} KB · self-contained — no server stores your data
            </p>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Free tier includes</p>
            <ul className="mt-1 space-y-0.5 list-disc pl-4">
              <li>Public read-only link with careerforge.app branding</li>
              <li>Anyone with the link can view (and ATS-parse) your resume</li>
              <li>Encoding is client-side; nothing is uploaded</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}