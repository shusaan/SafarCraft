"use client";

// Step 4 — Extras (optional). Three sub-sections:
//   - Skills (with category, comma-separated)
//   - Projects (name, role, description, technologies, highlights, url)
//   - Certifications + Languages (combined "Other" panel)
// User can skip this entire step.

import { useCallback, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useResumeStore } from "@/stores/resume-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "skills" | "projects" | "other";

export function StepExtras() {
  const [tab, setTab] = useState<Tab>("skills");

  return (
    <div className="space-y-5" aria-label="Skills, projects, certifications and languages">
      <p className="text-xs text-muted-foreground">
        This whole step is optional. Add anything that strengthens your resume — leave fields blank and move on.
      </p>
      <div
        role="tablist"
        aria-label="Extras sections"
        className="inline-flex rounded-md border bg-muted/30 p-1 text-xs"
      >
        {(["skills", "projects", "other"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-sm px-3 py-1 font-medium",
              tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            type="button"
          >
            {t === "skills" ? "Skills" : t === "projects" ? "Projects" : "Certs & Langs"}
          </button>
        ))}
      </div>

      {tab === "skills" && <SkillsPanel />}
      {tab === "projects" && <ProjectsPanel />}
      {tab === "other" && <OtherPanel />}
    </div>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────

function SkillsPanel() {
  const skills = useResumeStore((s) => s.data.skills);
  const updateSkills = useResumeStore((s) => s.updateSkills);

  const add = useCallback(() => {
    updateSkills([
      ...skills,
      { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), category: "", skills: [] },
    ]);
  }, [skills, updateSkills]);

  const remove = useCallback(
    (id: string) => updateSkills(skills.filter((s) => s.id !== id)),
    [skills, updateSkills],
  );

  const patch = useCallback(
    (id: string, partial: Partial<(typeof skills)[number]>) =>
      updateSkills(skills.map((s) => (s.id === id ? { ...s, ...partial } : s))),
    [skills, updateSkills],
  );

  return (
    <div className="space-y-3">
      {skills.length === 0 ? (
        <EmptyHint onAdd={add} label="No skill groups yet — group your skills (e.g. Languages, Frontend, Cloud)." />
      ) : (
        skills.map((g) => (
          <div key={g.id} className="rounded-md border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor={`sk-cat-${g.id}`} className="text-xs">
                Category
              </Label>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove skill group"
                onClick={() => remove(g.id)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                id={`sk-cat-${g.id}`}
                value={g.category}
                onChange={(e) => patch(g.id, { category: e.target.value })}
                placeholder="Languages"
              />
              <Input
                value={(g.skills ?? []).join(", ")}
                onChange={(e) =>
                  patch(g.id, {
                    skills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="TypeScript, Go, Rust"
              />
            </div>
          </div>
        ))
      )}
      <Button variant="outline" onClick={add} className="w-full gap-1.5" type="button">
        <Plus className="h-4 w-4" />
        Add skill group
      </Button>
    </div>
  );
}

// ─── Projects ────────────────────────────────────────────────────────────

function ProjectsPanel() {
  const projects = useResumeStore((s) => s.data.projects);
  const updateData = useResumeStore((s) => s.updateData);

  const updateProjects = useCallback(
    (next: typeof projects) => updateData({ projects: next }),
    [updateData],
  );

  const add = useCallback(() => {
    updateProjects([
      ...projects,
      {
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        name: "",
        role: "",
        description: "",
        technologies: [],
        url: "",
        highlights: [],
      },
    ]);
  }, [projects, updateProjects]);

  const remove = useCallback(
    (id: string) => updateProjects(projects.filter((p) => p.id !== id)),
    [projects, updateProjects],
  );

  const patch = useCallback(
    (id: string, partial: Partial<(typeof projects)[number]>) =>
      updateProjects(projects.map((p) => (p.id === id ? { ...p, ...partial } : p))),
    [projects, updateProjects],
  );

  return (
    <div className="space-y-3">
      {projects.length === 0 ? (
        <EmptyHint onAdd={add} label="No projects yet — add a side project or OSS contribution." />
      ) : (
        projects.map((p) => (
          <div key={p.id} className="rounded-md border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <Input
                value={p.name}
                onChange={(e) => patch(p.id, { name: e.target.value })}
                placeholder="EdgeQuery — distributed SQL engine"
                className="font-semibold"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove project"
                onClick={() => remove(p.id)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Input
              value={p.url ?? ""}
              onChange={(e) => patch(p.id, { url: e.target.value })}
              placeholder="github.com/you/project (URL)"
              className="mb-2"
            />
            <Textarea
              rows={3}
              value={p.description ?? ""}
              onChange={(e) => patch(p.id, { description: e.target.value })}
              placeholder="What it does and why it matters."
              className="mb-2"
            />
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                value={(p.technologies ?? []).join(", ")}
                onChange={(e) =>
                  patch(p.id, {
                    technologies: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="TypeScript, Rust, Postgres"
              />
              <Input
                value={(p.highlights ?? []).join("\n")}
                onChange={(e) =>
                  patch(p.id, {
                    highlights: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Highlights (one per line)"
              />
            </div>
          </div>
        ))
      )}
      <Button variant="outline" onClick={add} className="w-full gap-1.5" type="button">
        <Plus className="h-4 w-4" />
        Add project
      </Button>
    </div>
  );
}

// ─── Certifications + Languages ──────────────────────────────────────────

function OtherPanel() {
  const certifications = useResumeStore((s) => s.data.certifications);
  const languages = useResumeStore((s) => s.data.languages);
  const updateData = useResumeStore((s) => s.updateData);

  const updateCerts = useCallback(
    (next: typeof certifications) => updateData({ certifications: next }),
    [updateData],
  );
  const updateLangs = useCallback(
    (next: typeof languages) => updateData({ languages: next }),
    [updateData],
  );

  const addCert = useCallback(() => {
    updateCerts([
      ...certifications,
      {
        id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        name: "",
        issuer: "",
        date: "",
        url: "",
      },
    ]);
  }, [certifications, updateCerts]);

  const removeCert = useCallback(
    (id: string) => updateCerts(certifications.filter((c) => c.id !== id)),
    [certifications, updateCerts],
  );

  const patchCert = useCallback(
    (id: string, partial: Partial<(typeof certifications)[number]>) =>
      updateCerts(certifications.map((c) => (c.id === id ? { ...c, ...partial } : c))),
    [certifications, updateCerts],
  );

  const addLang = useCallback(() => {
    updateLangs([
      ...languages,
      { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), language: "", proficiency: "" },
    ]);
  }, [languages, updateLangs]);

  const removeLang = useCallback(
    (id: string) => updateLangs(languages.filter((l) => l.id !== id)),
    [languages, updateLangs],
  );

  const patchLang = useCallback(
    (id: string, partial: Partial<(typeof languages)[number]>) =>
      updateLangs(languages.map((l) => (l.id === id ? { ...l, ...partial } : l))),
    [languages, updateLangs],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Certifications</p>
          <Button variant="ghost" onClick={addCert} className="gap-1.5 text-xs" type="button">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {certifications.length === 0 ? (
          <EmptyHint onAdd={addCert} label="No certifications yet — leave blank if not relevant." small />
        ) : (
          certifications.map((c) => (
            <div key={c.id} className="rounded-md border bg-card p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  value={c.name}
                  onChange={(e) => patchCert(c.id, { name: e.target.value })}
                  placeholder="CKA — Kubernetes Administrator"
                />
                <Input
                  value={c.issuer}
                  onChange={(e) => patchCert(c.id, { issuer: e.target.value })}
                  placeholder="CNCF"
                />
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
                <Input
                  value={c.date}
                  onChange={(e) => patchCert(c.id, { date: e.target.value })}
                  placeholder="2024-03"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove certification"
                  onClick={() => removeCert(c.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Languages</p>
          <Button variant="ghost" onClick={addLang} className="gap-1.5 text-xs" type="button">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        {languages.length === 0 ? (
          <EmptyHint onAdd={addLang} label="No languages yet — leave blank if not relevant." small />
        ) : (
          languages.map((l) => (
            <div key={l.id} className="flex items-center gap-2 rounded-md border bg-card p-3">
              <Input
                value={l.language}
                onChange={(e) => patchLang(l.id, { language: e.target.value })}
                placeholder="English"
                className="flex-1"
              />
              <Input
                value={l.proficiency}
                onChange={(e) => patchLang(l.id, { proficiency: e.target.value })}
                placeholder="Native"
                className="w-32"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove language"
                onClick={() => removeLang(l.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyHint({
  onAdd,
  label,
  small = false,
}: {
  onAdd: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed bg-muted/30 text-center",
        small ? "p-3 text-xs" : "p-6 text-sm",
      )}
    >
      <p className="text-muted-foreground">{label}</p>
      <Button
        variant="outline"
        onClick={onAdd}
        className={cn("mt-2 gap-1.5", small ? "h-7 text-xs" : "")}
        size={small ? "sm" : "default"}
        type="button"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </Button>
    </div>
  );
}