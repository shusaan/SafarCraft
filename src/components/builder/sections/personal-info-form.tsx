"use client";

import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/toast";
import { ImagePlus, X, Upload, FileText } from "lucide-react";

export function PersonalInfoForm() {
  const personal = useResumeStore((s) => s.data.personal);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);
  const updateData = useResumeStore((s) => s.updateData);

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
  const { toast } = useToast();

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
        toast({ title: "We couldn't parse this file", description: "Please paste the text manually.", variant: "destructive" });
        return;
      }

      const id = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

      updateData({
        personal: {
          name:     parsed.name     || personal.name     || "",
          email:    parsed.email    || personal.email    || "",
          phone:    parsed.phone    || personal.phone    || "",
          location: parsed.location || personal.location || "",
          linkedin: parsed.linkedin || personal.linkedin || "",
          github:   parsed.github   || personal.github   || "",
          website:  parsed.website  || personal.website  || "",
          photo:    personal.photo  ?? null,
          summary:  parsed.summary  || "",
        },
        skills: Array.isArray(parsed.skillGroups) && parsed.skillGroups.length > 0
          ? parsed.skillGroups.map((g: { category: string; skills: string[] }) => ({
              id: id(),
              category: g.category || "Skills",
              skills: Array.isArray(g.skills) ? g.skills.filter(Boolean) : [],
            }))
          : [],
        experience: Array.isArray(parsed.experience)
          ? parsed.experience.map((e: Record<string, unknown>) => ({
              id: id(),
              company:    String(e.company    ?? ""),
              position:   String(e.position   ?? ""),
              location:   String(e.location   ?? ""),
              startDate:  String(e.startDate  ?? ""),
              endDate:    String(e.endDate    ?? ""),
              current:    String(e.endDate ?? "").toLowerCase() === "present" || Boolean(e.current),
              bullets:    Array.isArray(e.bullets)      ? (e.bullets      as string[]).filter(Boolean) : [],
              technologies: Array.isArray(e.technologies) ? (e.technologies as string[]).filter(Boolean) : [],
            }))
          : [],
        education: Array.isArray(parsed.education)
          ? parsed.education.map((e: Record<string, unknown>) => ({
              id: id(),
              institution: String(e.institution ?? ""),
              degree:      String(e.degree      ?? ""),
              field:       String(e.field       ?? ""),
              location:    String(e.location    ?? ""),
              startDate:   String(e.startDate   ?? ""),
              endDate:     String(e.endDate     ?? ""),
              gpa:         String(e.gpa         ?? ""),
              honors:      Array.isArray(e.honors) ? (e.honors as string[]).filter(Boolean) : [],
            }))
          : [],
        certifications: Array.isArray(parsed.certifications)
          ? parsed.certifications.map((c: Record<string, unknown>) => ({
              id: id(),
              name:   String(c.name   ?? ""),
              issuer: String(c.issuer ?? ""),
              date:   String(c.date   ?? ""),
              url:    String(c.url    ?? ""),
            }))
          : [],
        projects: Array.isArray(parsed.projects)
          ? parsed.projects.map((p: Record<string, unknown>) => ({
              id: id(),
              name:         String(p.name        ?? ""),
              role:         String(p.role        ?? ""),
              description:  String(p.description ?? ""),
              technologies: Array.isArray(p.technologies) ? (p.technologies as string[]).filter(Boolean) : [],
              url:          String(p.url         ?? ""),
              highlights:   Array.isArray(p.highlights) ? (p.highlights as string[]).filter(Boolean) : [],
            }))
          : [],
        languages: Array.isArray(parsed.languages)
          ? parsed.languages.map((l: Record<string, unknown>) => ({
              id: id(),
              language:    String(l.language    ?? ""),
              proficiency: String(l.proficiency ?? ""),
            }))
          : [],
      });

      toast({
        title: "CV imported",
        description: "Fields auto-populated. Review and adjust anything that looks off.",
        variant: "success",
      });
    } catch {
      toast({ title: "Import failed", description: "Please paste the text manually using the 'Create from Scratch' tab.", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  }, [updatePersonal, updateData, toast, personal]);

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
            accept=".docx,.pdf"
            className="hidden"
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
        <p className="mt-2 text-[10px] text-muted-foreground/60">
          We only collect anonymized IP addresses via Google Analytics to improve user experience.
          We do not store or share your resume text or personal data on our servers.
        </p>
      </div>

      <div className="flex items-start gap-6">
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
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
          <Button type="button" variant="outline" size="sm" className="mt-1 sm:hidden" onClick={() => document.querySelector<HTMLElement>('input[type="file"]')?.click()}>
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
