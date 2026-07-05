import type { ResumeData } from "@/types";

type DiffSection = {
  type: "added" | "removed" | "unchanged";
  text: string;
};

export function compareResumes(oldData: ResumeData, newData: ResumeData) {
  const changes: Array<{ section: string; diffs: DiffSection[] }> = [];

  const oldSkills = new Set(oldData.skills.flatMap((c) => c.skills));
  const newSkills = new Set(newData.skills.flatMap((c) => c.skills));

  const addedSkills = [...newSkills].filter((s) => !oldSkills.has(s));
  const removedSkills = [...oldSkills].filter((s) => !newSkills.has(s));

  const skillDiffs: DiffSection[] = [
    ...addedSkills.map((s) => ({ type: "added" as const, text: s })),
    ...removedSkills.map((s) => ({ type: "removed" as const, text: s })),
  ];

  if (skillDiffs.length > 0) changes.push({ section: "Skills", diffs: skillDiffs });

  const oldExp = oldData.experience.map((e) => e.position).join(", ");
  const newExp = newData.experience.map((e) => e.position).join(", ");
  if (oldExp !== newExp) {
    const expDiffs: DiffSection[] = newData.experience
      .filter((e) => !oldData.experience.some((o) => o.id === e.id))
      .map((e) => ({ type: "added" as const, text: `${e.position} at ${e.company}` }));
    changes.push({ section: "Experience", diffs: expDiffs });
  }

  return changes;
}

export function calculateImprovement(oldScore: number, newScore: number) {
  const diff = newScore - oldScore;
  return {
    diff,
    improved: diff > 0,
    percentage: oldScore > 0 ? Math.round((diff / oldScore) * 100) : 0,
  };
}
