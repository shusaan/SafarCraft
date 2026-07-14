import type { TemplateProps } from "./renderer";
import { SectionTitle, DateRange } from "./renderer";

export function Executive({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "10px" : layout.fontSize === "large" ? "13px" : "12px";
  const color = layout.primaryColor;

  const Header = (
    <div className="mb-6 rounded-sm p-5 text-white" style={{ backgroundColor: color }}>
      <div className="flex items-center gap-5">
        {layout.showPicture && data.personal.photo && (
          <img src={data.personal.photo} alt="" className="h-20 w-20 rounded-full border-2 border-white/50 object-cover" />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{data.personal.name || "Your Name"}</h1>
          <p className="mt-0.5 text-xs opacity-80">
            {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join("  ·  ")}
          </p>
          <p className="text-xs opacity-80">
            {[data.personal.linkedin, data.personal.github, data.personal.website].filter(Boolean).join("  ·  ")}
          </p>
        </div>
      </div>
    </div>
  );

  const Summary = data.personal.summary ? (
    <div className="mb-5">
      <SectionTitle color={color}>Professional Summary</SectionTitle>
      <p className="text-xs leading-relaxed">{data.personal.summary}</p>
    </div>
  ) : null;

  const Experience = data.experience.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Executive Experience</SectionTitle>
      {data.experience.map((exp) => (
        <div key={exp.id} className="mb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold">{exp.company}</span>
            <DateRange start={exp.startDate} end={exp.endDate} current={exp.current} />
          </div>
          <p className="text-xs font-semibold text-muted-foreground">{exp.position}{exp.location ? ` — ${exp.location}` : ""}</p>
          {exp.bullets.filter(Boolean).length > 0 && (
            <ul className="mt-1 space-y-0.5 text-xs">
              {exp.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span>{b}</span>
                </li>
              ))}
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
        <div key={edu.id} className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-xs font-semibold">{edu.degree}</span>
            {edu.field && <span className="text-xs text-muted-foreground"> in {edu.field}</span>}
            <p className="text-xs text-muted-foreground">{edu.institution}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <DateRange start={edu.startDate} end={edu.endDate} />
            {edu.gpa && <p>GPA: {edu.gpa}</p>}
          </div>
        </div>
      ))}
    </div>
  ) : null;

  const Skills = data.skills.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Core Competencies</SectionTitle>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {data.skills.flatMap((cat) => cat.skills).map((skill, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
            {skill}
          </span>
        ))}
      </div>
    </div>
  ) : null;

  const Certifications = data.certifications.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Certifications</SectionTitle>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {data.certifications.map((cert) => (
          <span key={cert.id}>{cert.name} — {cert.issuer}</span>
        ))}
      </div>
    </div>
  ) : null;

  const Projects = data.projects.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Projects</SectionTitle>
      {data.projects.map((proj) => (
        <div key={proj.id} className="mb-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold">{proj.name}</span>
            {proj.role && <span className="text-xs text-muted-foreground">{proj.role}</span>}
          </div>
          {proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}
          {proj.highlights.filter(Boolean).length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
              {proj.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  ) : null;

  const Languages = data.languages.length > 0 ? (
    <div className="mb-5">
      <SectionTitle color={color}>Languages</SectionTitle>
      <p className="text-xs text-muted-foreground">
        {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}
      </p>
    </div>
  ) : null;

  if (layout.columns === "two") {
    return (
      <div style={{ fontSize: fs }}>
        {Header}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
          <div>
            {Summary}{Skills}{Certifications}{Languages}
          </div>
          <div>
            {Experience}{Education}{Projects}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: fs }}>
      {Header}
      {Summary}
      {Experience}
      {Education}
      {Skills}
      {Certifications}
      {Projects}
      {Languages}
    </div>
  );
}
