import type { ResumeData } from "@/types";

export function exportMarkdown(data: ResumeData): Blob {
  const lines: string[] = [];

  lines.push(`# ${data.personal.name || "Your Name"}`);
  lines.push("");

  const contact = [data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);
  const social = [data.personal.linkedin, data.personal.github, data.personal.website].filter(Boolean).join(" | ");
  if (social) lines.push(social);
  lines.push("");

  if (data.personal.summary) {
    lines.push("## Summary");
    lines.push("");
    lines.push(data.personal.summary);
    lines.push("");
  }

  if (data.experience.length > 0) {
    lines.push("## Experience");
    lines.push("");
    for (const exp of data.experience) {
      lines.push(`### ${exp.position} — ${exp.company}`);
      lines.push(`*${exp.startDate} – ${exp.current ? "Present" : exp.endDate}*`);
      lines.push("");
      for (const bullet of exp.bullets.filter(Boolean)) {
        lines.push(`- ${bullet}`);
      }
      lines.push("");
    }
  }

  if (data.education.length > 0) {
    lines.push("## Education");
    lines.push("");
    for (const edu of data.education) {
      lines.push(`### ${edu.degree} in ${edu.field}`);
      lines.push(`*${edu.institution} — ${edu.startDate} to ${edu.endDate}*`);
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
      lines.push("");
    }
  }

  if (data.skills.length > 0) {
    lines.push("## Skills");
    lines.push("");
    for (const cat of data.skills) {
      lines.push(`- **${cat.category}**: ${cat.skills.join(", ")}`);
    }
    lines.push("");
  }

  if (data.certifications.length > 0) {
    lines.push("## Certifications");
    lines.push("");
    for (const cert of data.certifications) {
      lines.push(`- ${cert.name} — ${cert.issuer} (${cert.date})`);
    }
    lines.push("");
  }

  if (data.projects.length > 0) {
    lines.push("## Projects");
    lines.push("");
    for (const proj of data.projects) {
      lines.push(`### ${proj.name}`);
      if (proj.role) lines.push(`*Role: ${proj.role}*`);
      if (proj.description) lines.push(proj.description);
      for (const h of proj.highlights.filter(Boolean)) {
        lines.push(`- ${h}`);
      }
      lines.push("");
    }
  }

  if (data.languages.length > 0) {
    lines.push("## Languages");
    lines.push("");
    lines.push(data.languages.map((l) => `- ${l.language} (${l.proficiency})`).join("\n"));
    lines.push("");
  }

  return new Blob([lines.join("\n")], { type: "text/markdown" });
}
