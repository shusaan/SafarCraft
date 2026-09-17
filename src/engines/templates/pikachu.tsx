import type { TemplateProps } from "./renderer";
import { DateRange } from "./renderer";

// "Pikachu" — bold typography, accent block on the left, energetic feel.
export function Pikachu({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "10px" : layout.fontSize === "large" ? "13px" : "11px";
  const color = layout.primaryColor;

  return (
    <div style={{ fontSize: fs }}>
      <div className="mb-4 flex items-stretch gap-3">
        <div className="w-1.5 shrink-0 rounded" style={{ backgroundColor: color }} />
        <div className="flex-1">
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color }}>
            {data.personal.name || "Your Name"}
          </h1>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join("  ·  ")}
          </p>
          <p className="text-xs text-muted-foreground">
            {[data.personal.linkedin, data.personal.github, data.personal.website].filter(Boolean).join("  ·  ")}
          </p>
        </div>
      </div>

      {data.personal.summary && (
        <p className="mb-4 rounded-md border-l-4 bg-muted/30 px-3 py-2 text-xs italic leading-relaxed" style={{ borderColor: color }}>
          {data.personal.summary}
        </p>
      )}

      {data.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color }}>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold">{exp.position}</span>
                  {exp.company && <span className="text-xs"> · {exp.company}</span>}
                  {exp.location && <span className="text-xs text-muted-foreground"> · {exp.location}</span>}
                </div>
                <DateRange start={exp.startDate} end={exp.endDate} current={exp.current} />
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-3 text-xs">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="relative pl-3 before:absolute before:left-0 before:content-['▸']" style={{ color }}>
                      <span className="text-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color }}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold">{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                  <span className="text-xs text-muted-foreground"> — {edu.institution}{edu.location ? `, ${edu.location}` : ""}</span>
                </div>
                <DateRange start={edu.startDate} end={edu.endDate} />
              </div>
              {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color }}>Skills</h2>
          {data.skills.map((cat) => (
            <p key={cat.id} className="text-xs">
              <span className="font-bold" style={{ color }}>{cat.category}: </span>
              <span className="text-muted-foreground">{cat.skills.join(" · ")}</span>
            </p>
          ))}
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color }}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <span className="text-xs font-bold">{proj.name}</span>
              {proj.role && <span className="text-xs text-muted-foreground"> — {proj.role}</span>}
              {proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}
              {proj.highlights.filter(Boolean).length > 0 && (
                <ul className="mt-1 pl-3 text-xs">
                  {proj.highlights.filter(Boolean).map((h, i) => <li key={i}>· {h}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color }}>Certifications</h2>
          {data.certifications.map((cert) => (
            <p key={cert.id} className="text-xs">
              <span className="font-bold">{cert.name}</span>
              {cert.issuer && <span className="text-muted-foreground"> — {cert.issuer}</span>}
              {cert.date && <span className="text-muted-foreground"> ({cert.date})</span>}
            </p>
          ))}
        </section>
      )}

      {data.languages.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color }}>Languages</h2>
          <p className="text-xs text-muted-foreground">
            {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(" · ")}
          </p>
        </section>
      )}
    </div>
  );
}