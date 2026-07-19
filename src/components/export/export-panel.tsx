"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResumeStore } from "@/stores/resume-store";
import { exportResume } from "@/engines/export/export-engine";
import { authenticate, saveToDrive } from "@/engines/export/drive";
import { trackEvent } from "@/engines/analytics";
import type { ExportFormat, PaperSize } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Download, FileText, FileCode, CheckCircle, Cloud } from "lucide-react";

const paperSizes: Record<PaperSize, { label: string; dimensions: string }> = {
  letter: { label: "US Letter", dimensions: '8.5" × 11"' },
  a4: { label: "A4", dimensions: "210 × 297 mm" },
  legal: { label: "US Legal", dimensions: '8.5" × 14"' },
};

const formats: Array<{
  id: ExportFormat;
  label: string;
  icon: typeof Download;
  description: string;
  useCase: string;
}> = [
  {
    id: "pdf",
    label: "PDF",
    icon: FileText,
    description: "Standard format for job applications",
    useCase: "Best for: Submitting to employers, ATS systems",
  },
  {
    id: "docx",
    label: "DOCX",
    icon: FileText,
    description: "Microsoft Word format",
    useCase: "Best for: Editing in Word, sharing with recruiters",
  },
  {
    id: "markdown",
    label: "Markdown",
    icon: FileCode,
    description: "Plain text with formatting",
    useCase: "Best for: GitHub profiles, documentation",
  },
];

export function ExportPanel() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());
  const [paperSize, setPaperSize] = useState<PaperSize>("letter");
  const data = useResumeStore((s) => s.data);
  const layout = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);
  const { toast } = useToast();

  const [driveSaving, setDriveSaving] = useState(false);

  const handleDriveSave = async () => {
    setDriveSaving(true);
    try {
      const token = await authenticate();
      if (!token) {
        toast({ title: "Google Drive sign-in required", description: "Please allow access to save to Drive.", variant: "default" });
        return;
      }
      const content = [
        `Job: ${data.personal.name}`,
        `Summary: ${data.personal.summary}`,
        "",
        ...data.experience.flatMap((e) => [
          `${e.position} at ${e.company}`,
          ...e.bullets.map((b) => `  - ${b}`),
          "",
        ]),
      ].join("\n");
      const result = await saveToDrive(content, `Application_Package_${Date.now()}.txt`);
      if (result) {
        toast({ title: "Saved to Google Drive", variant: "success" });
      } else {
        toast({ title: "Drive save failed", description: "Check your connection and permissions.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Drive save failed", variant: "destructive" });
    } finally {
      setDriveSaving(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    trackEvent("export_click", { format, paperSize });
    setExporting(format);
    try {
      await exportResume(data, layout, format, template, paperSize);
      setExported((prev) => new Set(prev).add(format));
      toast({ title: `Exported as ${format.toUpperCase()}`, variant: "success" });
    } catch {
      toast({
        title: "Export failed",
        description: `Could not generate ${format.toUpperCase()} file. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Export</h2>
        <p className="text-sm text-muted-foreground">Download your resume in various formats</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Paper Size</label>
        <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(paperSizes).map(([key, { label, dimensions }]) => (
              <SelectItem key={key} value={key}>
                {label} — {dimensions}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {formats.map(({ id, label, icon: Icon, description, useCase }) => (
          <Card key={id} className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  {exported.has(id) && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{useCase}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={exporting === id}
                onClick={() => handleExport(id)}
              >
                {exporting === id ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Exporting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Google Drive save */}
      <div className="border-t pt-4">
        <p className="mb-2 text-sm font-medium">Save to Cloud</p>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-muted p-2">
              <Cloud className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium">Google Drive</span>
              <p className="text-xs text-muted-foreground">Save your application package for later editing</p>
            </div>
            <Button variant="ghost" size="sm" disabled={driveSaving} onClick={handleDriveSave}>
              {driveSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Save to Drive
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        All exports are ATS-compliant with selectable text and clickable links
      </p>
    </div>
  );
}
