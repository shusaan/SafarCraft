"use client";

import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/toast";
import { ImagePlus, X, Upload, FileText, Check, XCircle } from "lucide-react";

interface ParsedCVLike {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  skillGroups?: Array<{ category: string; skills: string[] }>;
  experience?: Array<Record<string, unknown>>;
  education?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  certifications?: Array<Record<string, unknown>>;
  languages?: Array<Record<string, unknown>>;
}

type PreviewCounts = {
  name: boolean;
  email: boolean;
  phone: boolean;
  location: boolean;
  linkedin: boolean;
  github: boolean;
  website: boolean;
  summary: boolean;
  skillCount: number;
  experienceCount: number;
  educationCount: number;
  projectCount: number;
  certificationCount: number;
  languageCount: number;
};

function summarise(parsed: ParsedCVLike): PreviewCounts {
  return {
    name:      !!parsed.name,
    email:     !!parsed.email,
    phone:     !!parsed.phone,
    location:  !!parsed.location,
    linkedin:  !!parsed.linkedin,
    github:    !!parsed.github,
    website:   !!parsed.website,
    summary:   !!parsed.summary,
    skillCount:        (parsed.skillGroups ?? []).reduce((n, g) => n + (g.skills?.length ?? 0), 0),
    experienceCount:   parsed.experience?.length ?? 0,
    educationCount:    parsed.education?.length ?? 0,
    projectCount:      parsed.projects?.length ?? 0,
    certificationCount: parsed.certifications?.length ?? 0,
    languageCount:     parsed.languages?.length ?? 0,
  };
}

export function PersonalInfoForm() {
  const personal = useResumeStore((s) => s.data.personal);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);
  const updateData = useResumeStore((s) => s.updateData);
  const undo = useResumeStore((s) => s.undo);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          updatePersonal({ photo: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    },
    [updatePersonal],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<{ parsed: ParsedCVLike; counts: PreviewCounts; fileName: string } | null>(null);
  const [appliedAt, setAppliedAt] = useState<number | null>(null);
  const { toast } = useToast();

  const applyParsed = useCallback((parsed: ParsedCVLike) => {
    const id = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const str = (v: unknown) => (typeof v === "string" ? v : "");

    // Merge strategy: only overwrite fields the parser returned non-empty
    // values for. Otherwise the existing data is preserved (we simply omit
    // those keys from the update — the store merges the partial).
    const partial: Parameters<typeof updateData>[0] = {
      personal: {
        name:     parsed.name     || personal.name     || "",
        email:    parsed.email    || personal.email    || "",
        phone:    parsed.phone    || personal.phone    || "",
        location: parsed.location || personal.location || "",
        linkedin: parsed.linkedin || personal.linkedin || "",
        github:   parsed.github   || personal.github   || "",
        website:  parsed.website  || personal.website  || "",
        photo:    personal.photo  ?? null,
        summary:  parsed.summary  || personal.summary  || "",
      },
    };

    if (Array.isArray(parsed.skillGroups) && parsed.skillGroups.length > 0) {
      partial.skills = parsed.skillGroups.map((g) => ({
        id: id(),
        category: g.category || "Skills",
        skills: Array.isArray(g.skills) ? g.skills.filter(Boolean) : [],
      }));
    }
    if (Array.isArray(parsed.experience) && parsed.experience.length > 0) {
      partial.experience = parsed.experience.map((e) => ({
        id: id(),
        company:    str(e.company),
        position:   str(e.position),
        location:   str(e.location),
        startDate:  str(e.startDate),
        endDate:    str(e.endDate),
        current:    str(e.endDate).toLowerCase() === "present" || Boolean(e.current),
        bullets:    Array.isArray(e.bullets)      ? (e.bullets      as string[]).filter(Boolean) : [],
        technologies: Array.isArray(e.technologies) ? (e.technologies as string[]).filter(Boolean) : [],
      }));
    }
    if (Array.isArray(parsed.education) && parsed.education.length > 0) {
      partial.education = parsed.education.map((e) => ({
        id: id(),
        institution: str(e.institution),
        degree:      str(e.degree),
        field:       str(e.field),
        location:    str(e.location),
        startDate:   str(e.startDate),
        endDate:     str(e.endDate),
        gpa:         str(e.gpa),
        honors:      Array.isArray(e.honors) ? (e.honors as string[]).filter(Boolean) : [],
      }));
    }
    if (Array.isArray(parsed.certifications) && parsed.certifications.length > 0) {
      partial.certifications = parsed.certifications.map((c) => ({
        id: id(),
        name:   str(c.name),
        issuer: str(c.issuer),
        date:   str(c.date),
        url:    str(c.url),
      }));
    }
    if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      partial.projects = parsed.projects.map((p) => ({
        id: id(),
        name:         str(p.name),
        role:         str(p.role),
        description:  str(p.description),
        technologies: Array.isArray(p.technologies) ? (p.technologies as string[]).filter(Boolean) : [],
        url:          str(p.url),
        highlights:   Array.isArray(p.highlights) ? (p.highlights as string[]).filter(Boolean) : [],
      }));
    }
    if (Array.isArray(parsed.languages) && parsed.languages.length > 0) {
      partial.languages = parsed.languages.map((l) => ({
        id: id(),
        language:    str(l.language),
        proficiency: str(l.proficiency),
      }));
    }

    updateData(partial);
    setAppliedAt(Date.now());
  }, [personal, updateData]);

  const handleImportCV = useCallback(async (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "docx" && ext !== "pdf") {
      toast({ title: "Unsupported format", description: "Please upload a .docx or .pdf file.", variant: "destructive" });
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const parseRes = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      const resData = await parseRes.json().catch(() => ({ error: "Parse failed" }));

      if (!parseRes.ok) {
        const msg = resData?.error ?? "We couldn't parse this file";
        toast({
          title: parseRes.status === 501 ? msg : "Could not parse file",
          description: parseRes.status === 501 ? undefined : msg,
          variant: "destructive",
        });
        return;
      }

      const { parsed } = resData;

      if (!parsed) {
        toast({
          title: "We couldn't parse this file",
          description: "The file may be a scanned image or use a format we can't read. You can fill the fields manually below.",
          variant: "destructive",
        });
        return;
      }

      const counts = summarise(parsed);
      setPreview({ parsed, counts, fileName: file.name });
      setAppliedAt(null);
    } catch {
      toast({
        title: "Import failed",
        description: "Something went wrong reading the file. You can still fill the fields manually below.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  }, [toast]);

  const onApply = useCallback(() => {
    if (!preview) return;
    applyParsed(preview.parsed);
    toast({
      title: "CV imported",
      description: "Fields auto-populated. Review and adjust anything that looks off.",
      variant: "success",
    });
  }, [preview, applyParsed, toast]);

  const onDiscard = useCallback(() => {
    setPreview(null);
    setAppliedAt(null);
  }, []);

  const onUndo = useCallback(() => {
    undo();
    setAppliedAt(null);
    toast({ title: "Import reverted", variant: "default" });
  }, [undo, toast]);

  return (
    <div className="space-y-6">
      {/* Import CV */}
      <div className="rounded-lg border border-dashed p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Import Existing CV</p>
            <p className="text-xs text-muted-foreground">Upload a .docx or .pdf file to pre-fill your details</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            data-testid="cv-file-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportCV(f);
              e.target.value = "";
            }}
          />
          <Button variant="outline" size="sm" disabled={importing} onClick={() => fileInputRef.current?.click()}>
            {importing ? "Parsing..." : <><FileText className="h-4 w-4 mr-1" /> Browse</>}
          </Button>
        </div>

        {/* Preview card */}
        {preview && (
          <div className="mt-4 rounded-md border bg-muted/30 p-3" data-testid="cv-preview-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Parsed from</p>
                <p className="truncate text-sm font-medium">{preview.fileName}</p>
              </div>
              {appliedAt === null && (
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onDiscard} aria-label="Discard preview">
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
              <PreviewRow label="Name"      ok={preview.counts.name} />
              <PreviewRow label="Email"     ok={preview.counts.email} />
              <PreviewRow label="Phone"     ok={preview.counts.phone} />
              <PreviewRow label="Location"  ok={preview.counts.location} />
              <PreviewRow label="LinkedIn"  ok={preview.counts.linkedin} />
              <PreviewRow label="GitHub"    ok={preview.counts.github} />
              <PreviewRow label="Website"   ok={preview.counts.website} />
              <PreviewRow label="Summary"   ok={preview.counts.summary} />
              <PreviewRow label="Experience" count={preview.counts.experienceCount} />
              <PreviewRow label="Education"  count={preview.counts.educationCount} />
              <PreviewRow label="Skills"     count={preview.counts.skillCount} suffix="items" />
              <PreviewRow label="Projects"   count={preview.counts.projectCount} />
              <PreviewRow label="Certifications" count={preview.counts.certificationCount} />
              <PreviewRow label="Languages"  count={preview.counts.languageCount} />
            </ul>

            {appliedAt === null ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={onApply} data-testid="cv-apply-button">
                  <Check className="mr-1 h-3.5 w-3.5" /> Apply import
                </Button>
                <Button size="sm" variant="ghost" onClick={onDiscard} data-testid="cv-discard-button">
                  Discard
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Existing data is kept for any field we couldn't read.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-green-500/30 bg-green-50/50 px-2 py-1.5 text-xs dark:bg-green-950/30">
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-700 dark:text-green-300">Applied. Review fields below.</span>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={onUndo} data-testid="cv-undo-button">
                  Undo
                </Button>
              </div>
            )}
          </div>
        )}

        <p className="mt-2 text-[10px] text-muted-foreground/60">
          We only collect anonymized IP addresses via Google Analytics to improve user experience.
          We do not store or share your resume text or personal data on our servers.
        </p>
      </div>

      <div className="flex items-start gap-6">
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} data-testid="photo-file-input" />
          {personal.photo ? (
            <div className="relative h-24 w-24">
              <img src={personal.photo} alt="Preview" className="h-24 w-24 rounded-full object-cover" />
              <Button variant="ghost" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground" onClick={(e) => { e.stopPropagation(); updatePersonal({ photo: null }); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
              <ImagePlus className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Profile Photo</p>
          <p className="text-xs text-muted-foreground">Click to upload or drag and drop (PNG, JPG, WEBP, max 5MB)</p>
          <Button type="button" variant="outline" size="sm" className="mt-1 sm:hidden" onClick={() => document.querySelector<HTMLElement>('[data-testid="photo-file-input"]')?.click()}>
            Browse Files
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={personal.name} onChange={(e) => updatePersonal({ name: e.target.value })} placeholder="e.g., Alex Johnson" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={personal.email} onChange={(e) => updatePersonal({ email: e.target.value })} placeholder="e.g., alex.johnson@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={personal.phone} onChange={(e) => updatePersonal({ phone: e.target.value })} placeholder="e.g., +1 (555) 123-4567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={personal.location} onChange={(e) => updatePersonal({ location: e.target.value })} placeholder="e.g., San Francisco, CA" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input id="linkedin" value={personal.linkedin} onChange={(e) => updatePersonal({ linkedin: e.target.value })} placeholder="e.g., linkedin.com/in/alexjohnson" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input id="github" value={personal.github} onChange={(e) => updatePersonal({ github: e.target.value })} placeholder="e.g., github.com/alexjohnson" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={personal.website} onChange={(e) => updatePersonal({ website: e.target.value })} placeholder="e.g., https://alexjohnson.dev" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          rows={5}
          value={personal.summary}
          onChange={(e) => updatePersonal({ summary: e.target.value })}
          placeholder="e.g., Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and open-source contributions."
        />
      </div>
    </div>
  );
}

function PreviewRow({ label, ok, count, suffix }: { label: string; ok?: boolean; count?: number; suffix?: string }) {
  const filled = ok ?? (typeof count === "number" && count > 0);
  return (
    <li className="flex items-center gap-1.5">
      {filled ? (
        <Check className="h-3 w-3 shrink-0 text-green-600" aria-hidden="true" />
      ) : (
        <XCircle className="h-3 w-3 shrink-0 text-muted-foreground/40" aria-hidden="true" />
      )}
      <span className={filled ? "" : "text-muted-foreground"}>
        {label}
        {typeof count === "number" ? (
          <span className="ml-1 font-mono text-[10px] text-muted-foreground">
            {count} {suffix ?? ""}
          </span>
        ) : null}
      </span>
    </li>
  );
}
