import type { TemplateProps } from "./renderer";
import { SectionTitle, DateRange } from "./renderer";

export function ModernProfessional({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "10px" : layout.fontSize === "large" ? "13px" : "11px";
  const color = layout.primaryColor;

  const Header = (
    <div className="mb-6">
      <div className="flex items-start gap-4">
        {layout.showPicture && data.personal.photo && (
          <img src={data.personal.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color }}>{data.personal.name || "Your Name"}</h1>
          <p className="text-xs text-muted-foreground">
            {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join("  ·  ")}
          </p>
          <p className="text-xs text-muted-foreground">
            {[data.personal.linkedin, data.personal.github, data.personal.website].filter(Boolean).join("  ·  ")}
          </p>
        </div>
      </div>
    </div>
  );

  const Summary = data.personal.summary ? (
    <div className="mb-5">
      <SectionTitle color={color}>About</SectionTitle>
      <p className="text-xs leading-relaxed">{data.personal.summary}</p>
    </div>
  ) : null;

  const Experience = data.experience.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Experience</SectionTitle>
      {data.experience.map((exp) => (
        <div key={exp.id} className="mb-3 border-l-2 pl-3" style={{ borderColor: color }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold">{exp.position}</span>
              {exp.company && <span className="text-xs text-muted-foreground"> at {exp.company}</span>}
            </div>
            <DateRange start={exp.startDate} end={exp.endDate} current={exp.current} />
          </div>
          {exp.location && <p className="text-xs text-muted-foreground">{exp.location}</p>}
          {exp.bullets.filter(Boolean).length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
              {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  ) : null;

  const Education = data.education.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Education</SectionTitle>
      {data.education.map((edu) => (
        <div key={edu.id} className="mb-2 border-l-2 pl-3" style={{ borderColor: color }}>
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold">{edu.degree} in {edu.field}</span>
            <DateRange start={edu.startDate} end={edu.endDate} />
          </div>
          <p className="text-xs text-muted-foreground">{edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ""}</p>
        </div>
      ))}
    </div>
  ) : null;

  const Skills = data.skills.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Skills</SectionTitle>
      <div className="flex flex-wrap gap-1">
        {data.skills.flatMap((cat) => cat.skills).map((skill, i) => (
          <span key={i} className="rounded-sm bg-muted px-2 py-0.5 text-xs">{skill}</span>
        ))}
      </div>
    </div>
  ) : null;

  const Projects = data.projects.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Projects</SectionTitle>
      {data.projects.map((proj) => (
        <div key={proj.id} className="mb-2 border-l-2 pl-3" style={{ borderColor: color }}>
          <span className="text-xs font-semibold">{proj.name}</span>
          {proj.role && <span className="text-xs text-muted-foreground"> — {proj.role}</span>}
          {proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}
        </div>
      ))}
    </div>
  ) : null;

  if (layout.columns === "two") {
    return (
      <div className="flex gap-6" style={{ fontSize: fs }}>
        <div className="w-1/3">
          <div className="rounded-lg bg-gradient-to-r from-background to-muted p-4 mb-4">{Header}</div>
          {Summary}{Skills}
        </div>
        <div className="w-2/3">{Experience}{Education}{Projects}</div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: fs }}>
      <div className="rounded-lg bg-gradient-to-r from-background to-muted p-4">{Header}</div>
      <div className="mt-4">{Summary}{Experience}{Education}{Skills}{Projects}</div>
    </div>
  );
}
