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
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim()).slice(0, 50);
      const summary = lines.join("\n").replace(/<[^>]*>/g, "").trim();
      if (summary.length > 20) {
        updatePersonal({ summary });
        toast({ title: "CV imported", description: "Text extracted. Review and adjust below.", variant: "success" });
      } else {
        toast({
          title: "We couldn't parse this file",
          description: "Please paste the text manually using the 'Create from Scratch' tab.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "We couldn't parse this file",
        description: "Please paste the text manually using the 'Create from Scratch' tab.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  }, [updatePersonal, toast]);

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
