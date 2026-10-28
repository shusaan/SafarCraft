"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResumeStore } from "@/stores/resume-store";
import { exportResume } from "@/engines/export/export-engine";
import { importJSONResume } from "@/engines/export/providers/json-resume-import";
import {
  authenticate,
  saveToDrive,
  findOrCreateFolder,
  listFilesInFolder,
  downloadFileContent,
  isDriveConfigured,
  type DriveFileMeta,
} from "@/engines/export/drive";
import { trackEvent } from "@/engines/analytics";
import type { ExportFormat, PaperSize } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Download, FileText, FileCode, CheckCircle, Cloud, FolderOpen, Upload, FileJson } from "lucide-react";

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
  {
    id: "json",
    label: "JSON Resume",
    icon: FileJson,
    description: "Open standard, swap with other tools",
    useCase: "Best for: Importing into Reactive Resume, FlowCV, etc.",
  },
];

export function ExportPanel() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Set<string>>(new Set());
  const [paperSize, setPaperSize] = useState<PaperSize>("letter");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const data = useResumeStore((s) => s.data);
  const layout = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);
  const replaceData = useResumeStore((s) => s.replaceData);
  const setLayout = useResumeStore((s) => s.setLayout);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const { toast } = useToast();

  const [driveSaving, setDriveSaving] = useState(false);
  const [driveListing, setDriveListing] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileMeta[] | null>(null);
  const [driveImporting, setDriveImporting] = useState<string | null>(null);

  /** ArrayBuffer → base64 without blowing the argument-size limit. */
  const toBase64 = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  };

  const requireDrive = async (): Promise<boolean> => {
    if (!isDriveConfigured()) {
      toast({
        title: "Google Drive is not configured",
        description: "This instance has no Google OAuth client id set up.",
        variant: "default",
      });
      return false;
    }
    const token = await authenticate();
    if (!token) {
      toast({
        title: "Google Drive sign-in required",
        description: "Please allow access to continue.",
        variant: "default",
      });
      return false;
    }
    return true;
  };

  const handleDriveSave = async () => {
    setDriveSaving(true);
    try {
      if (!(await requireDrive())) return;

      const folder = await findOrCreateFolder("SafarCraft");
      if (!folder) {
        toast({ title: "Drive folder unavailable", description: "Could not find or create the SafarCraft folder.", variant: "destructive" });
        return;
      }

      const personName = data.personal.name.replace(/[^a-zA-Z0-9]/g, "_") || "Resume";

      // 1) .docx application package
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ children: [new TextRun({ text: data.personal.name || "Resume", bold: true, size: 28 })], heading: HeadingLevel.HEADING_1 }),
            ...(data.personal.summary ? [new Paragraph({ children: [new TextRun({ text: data.personal.summary, size: 20 })], spacing: { after: 200 } })] : []),
            ...data.experience.flatMap((e) => [
              new Paragraph({ children: [new TextRun({ text: `${e.position} at ${e.company}`, bold: true, size: 22 })] }),
              new Paragraph({ children: [new TextRun({ text: `${e.startDate} - ${e.endDate || "Present"}`, size: 18, italics: true })] }),
              ...e.bullets.filter(Boolean).map((b) =>
                new Paragraph({ children: [new TextRun({ text: `  \u2022  ${b}`, size: 20 })], spacing: { after: 80 } })
              ),
              new Paragraph({ spacing: { after: 120 } }),
            ]),
          ],
        }],
      });
      const blob = await Packer.toBlob(doc);
      const base64 = toBase64(await blob.arrayBuffer());

      const docxName = `${personName}_Application_Package.docx`;
      const saved = await saveToDrive(
        base64,
        docxName,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        folder.id,
        true,
      );
      if (!saved) {
        toast({ title: "Drive save failed", description: "Check your connection and permissions.", variant: "destructive" });
        return;
      }

      // 2) Editable JSON draft so the resume can be loaded back into the builder
      const draft = JSON.stringify({ app: "safarcraft", version: 1, data, template, layout });
      await saveToDrive(draft, `${personName}_SafarCraft_Draft.json`, "application/json", folder.id, false);

      trackEvent("drive_save", { folder: folder.name });
      toast({
        title: "Saved to Google Drive",
        description: `"${docxName}" and an editable draft are in your "${folder.name}" folder.`,
        variant: "success",
      });
    } catch {
      toast({ title: "Drive save failed", variant: "destructive" });
    } finally {
      setDriveSaving(false);
    }
  };

  const handleDriveLoad = async () => {
    setDriveListing(true);
    try {
      if (!(await requireDrive())) {
        setDriveFiles(null);
        return;
      }
      const folder = await findOrCreateFolder("SafarCraft");
      if (!folder) {
        toast({ title: "Drive folder unavailable", variant: "destructive" });
        return;
      }
      setDriveFiles(await listFilesInFolder(folder.id, "application/json"));
    } catch {
      toast({ title: "Could not list Drive files", variant: "destructive" });
      setDriveFiles(null);
    } finally {
      setDriveListing(false);
    }
  };

  const handleImportDraft = async (fileId: string) => {
    setDriveImporting(fileId);
    try {
      const raw = await downloadFileContent(fileId);
      if (!raw) throw new Error("download failed");
      const parsed = JSON.parse(raw);
      if (!parsed?.data?.personal) throw new Error("not a SafarCraft draft");
      replaceData(parsed.data);
      if (parsed.template) setTemplate(parsed.template);
      if (parsed.layout) setLayout(parsed.layout);
      setDriveFiles(null);
      toast({
        title: "Draft loaded from Drive",
        description: "Your saved resume is back in the builder.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Import failed",
        description: "This file doesn't look like a SafarCraft draft.",
        variant: "destructive",
      });
    } finally {
      setDriveImporting(null);
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Export</h2>
          <p className="text-sm text-muted-foreground">Download in any format, or bring in an existing JSON Resume.</p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Import JSON Resume
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            data-testid="import-json-input"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImporting(true);
              try {
                const text = await file.text();
                const { data: imported, warnings } = importJSONResume(text);
                replaceData(imported);
                const summary = warnings.length
                  ? ` — ${warnings.length} warning${warnings.length > 1 ? "s" : ""}`
                  : "";
                toast({
                  title: "Resume imported",
                  description: `${imported.experience.length} jobs, ${imported.skills.length} skill groups${summary}.`,
                  variant: "success",
                });
              } catch (err) {
                toast({
                  title: "Import failed",
                  description: err instanceof Error ? err.message : "Could not parse this JSON Resume file.",
                  variant: "destructive",
                });
              } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
          />
        </div>
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
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-muted p-2">
              <Cloud className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <span className="font-medium">Google Drive</span>
              <p className="text-xs text-muted-foreground">
                Saves to your one "SafarCraft" folder — a .docx package plus an
                editable draft you can load back anytime.
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={driveSaving || driveListing}
                onClick={handleDriveLoad}
                title="Load a draft from Drive"
              >
                {driveListing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <FolderOpen className="h-4 w-4" />
                )}
                Load
              </Button>
              <Button variant="ghost" size="sm" disabled={driveSaving || driveListing} onClick={handleDriveSave}>
                {driveSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Save
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load from Drive dialog */}
      {driveFiles && (
        <Dialog open onOpenChange={(open) => !open && setDriveFiles(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load from Google Drive</DialogTitle>
            <DialogDescription>
              Pick a saved draft to load back into the builder.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {driveFiles.length === 0 && (
              <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                No saved drafts in your "SafarCraft" folder yet. Use Save to create one.
              </p>
            )}
            {driveFiles.map((f) => (
              <button
                key={f.id}
                className="flex w-full items-center justify-between gap-2 rounded-md border p-3 text-left transition-colors hover:bg-accent disabled:opacity-60"
                disabled={driveImporting === f.id}
                onClick={() => handleImportDraft(f.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  {f.modifiedTime && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(f.modifiedTime).toLocaleString()}
                    </p>
                  )}
                </div>
                {driveImporting === f.id ? (
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      )}

      <p className="text-xs text-muted-foreground text-center">
        All exports are ATS-compliant with selectable text and clickable links
      </p>
    </div>
  );
}
