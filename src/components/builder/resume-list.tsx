"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/stores/resume-store";
import { useToast } from "@/components/ui/toast";
import { generateId } from "@/lib/utils";
import { defaultResumeData } from "@/types";

export function ResumeList({ onClose }: { onClose: () => void }) {
  const resumes = useResumeStore((s) => s.resumes);
  const setResumes = useResumeStore((s) => s.setResumes);
  const setActiveResume = useResumeStore((s) => s.setActiveResume);
  const activeResumeId = useResumeStore((s) => s.activeResumeId);
  const { toast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createResume = () => {
    const id = generateId();
    const newResume = { id, title: newTitle || "Untitled Resume", data: defaultResumeData };
    setResumes([...resumes, newResume]);
    setActiveResume(id);
    setShowNew(false);
    setNewTitle("");
    toast({ title: "Resume created", variant: "success" });
  };

  const deleteResume = (id: string) => {
    const filtered = resumes.filter((r) => r.id !== id);
    setResumes(filtered);
    if (activeResumeId === id) {
      if (filtered.length > 0) {
        setActiveResume(filtered[0]!.id);
      } else {
        const newId = generateId();
        setResumes([{ id: newId, title: "Untitled Resume", data: defaultResumeData }]);
        setActiveResume(newId);
      }
    }
    setDeleteId(null);
    toast({ title: "Resume deleted" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">My Resumes</h3>
        <Button size="sm" onClick={() => setShowNew(true)}>
          New
        </Button>
      </div>

      <div className="space-y-2">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent ${
              activeResumeId === resume.id ? "border-primary bg-accent" : ""
            }`}
            onClick={() => {
              setActiveResume(resume.id);
              onClose();
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{resume.title}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(resume.id);
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Resume</DialogTitle>
            <DialogDescription>Enter a name for your new resume.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Resume Title</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Untitled Resume" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button onClick={createResume}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && deleteResume(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
