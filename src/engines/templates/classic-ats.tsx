import type { TemplateProps } from "./renderer";
import { SectionTitle, DateRange } from "./renderer";

export function ClassicATS({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "10px" : layout.fontSize === "large" ? "13px" : "11px";
  const color = layout.primaryColor;

  const Header = (
    <div className="mb-5 text-center">
      <h1 className="text-xl font-bold tracking-tight" style={{ color }}>{data.personal.name || "Your Name"}</h1>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(" | ")}
      </div>
      <div className="mt-0.5 flex flex-wrap justify-center gap-x-3 text-xs text-muted-foreground">
        {[data.personal.linkedin, data.personal.github, data.personal.website].filter(Boolean).join(" | ")}
      </div>
    </div>
  );

  const Summary = data.personal.summary ? (
    <div className="mb-4">
      <SectionTitle color={color}>Summary</SectionTitle>
      <p className="text-xs leading-relaxed text-muted-foreground">{data.personal.summary}</p>
    </div>
  ) : null;

  const Experience = data.experience.length > 0 ? (
    <div className="mb-4">
      <SectionTitle color={color}>Experience</SectionTitle>
      {data.experience.map((exp) => (
        <div key={exp.id} className="mb-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold">{exp.position}</span>
              <span className="text-xs text-muted-foreground"> — {exp.company}</span>
              {exp.location && <span className="text-xs text-muted-foreground">, {exp.location}</span>}
            </div>
            <DateRange start={exp.startDate} end={exp.endDate} current={exp.current} />
          </div>
          {exp.bullets.filter(Boolean).length > 0 && (
            <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
              {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  ) : null;

  const Education = data.education.length > 0 ? (
    <div className="mb-4">
      <SectionTitle color={color}>Education</SectionTitle>
      {data.education.map((edu) => (
        <div key={edu.id} className="mb-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold">{edu.degree}</span>
              {edu.field && <span className="text-xs text-muted-foreground"> in {edu.field}</span>}
            </div>
            <DateRange start={edu.startDate} end={edu.endDate} />
          </div>
          <p className="text-xs text-muted-foreground">{edu.institution}{edu.location ? ` — ${edu.location}` : ""}</p>
          {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
        </div>
      ))}
    </div>
  ) : null;

  const Skills = data.skills.length > 0 ? (
    <div className="mb-4">
      <SectionTitle color={color}>Skills</SectionTitle>
      {data.skills.map((cat) => (
        <p key={cat.id} className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{cat.category}: </span>
          {cat.skills.join(", ")}
        </p>
      ))}
    </div>
  ) : null;

  const Certifications = data.certifications.length > 0 ? (
    <div className="mb-4">
      <SectionTitle color={color}>Certifications</SectionTitle>
      {data.certifications.map((cert) => (
        <p key={cert.id} className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{cert.name}</span>
          {cert.issuer ? ` — ${cert.issuer}` : ""}{cert.date ? ` (${cert.date})` : ""}
        </p>
      ))}
    </div>
  ) : null;

  const Projects = data.projects.length > 0 ? (
    <div className="mb-4">
      <SectionTitle color={color}>Projects</SectionTitle>
      {data.projects.map((proj) => (
        <div key={proj.id} className="mb-2">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold">{proj.name}</span>
            {proj.role && <span className="text-xs text-muted-foreground">{proj.role}</span>}
          </div>
          {proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}
          {proj.highlights.filter(Boolean).length > 0 && (
            <ul className="mt-0.5 list-disc pl-4 text-xs text-muted-foreground">
              {proj.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  ) : null;

  const Languages = data.languages.length > 0 ? (
    <div className="mb-4">
      <SectionTitle color={color}>Languages</SectionTitle>
      <p className="text-xs text-muted-foreground">
        {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}
      </p>
    </div>
  ) : null;

  if (layout.columns === "two") {
    return (
      <div className="flex gap-6" style={{ fontSize: fs }}>
        <div className="w-1/3">{Header}{Summary}{Skills}{Certifications}{Languages}</div>
        <div className="w-2/3">{Experience}{Education}{Projects}</div>
      </div>
    );
  }

  return <div style={{ fontSize: fs }}>{Header}{Summary}{Experience}{Education}{Skills}{Certifications}{Projects}{Languages}</div>;
}
