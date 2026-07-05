"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";

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

  return (
    <div className="space-y-6">
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
          <p className="text-xs text-muted-foreground">Click to upload (PNG, JPG, WEBP, max 5MB)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={personal.name} onChange={(e) => updatePersonal({ name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={personal.email} onChange={(e) => updatePersonal({ email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={personal.phone} onChange={(e) => updatePersonal({ phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={personal.location} onChange={(e) => updatePersonal({ location: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input id="linkedin" value={personal.linkedin} onChange={(e) => updatePersonal({ linkedin: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input id="github" value={personal.github} onChange={(e) => updatePersonal({ github: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={personal.website} onChange={(e) => updatePersonal({ website: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          rows={5}
          value={personal.summary}
          onChange={(e) => updatePersonal({ summary: e.target.value })}
        />
      </div>
    </div>
  );
}
