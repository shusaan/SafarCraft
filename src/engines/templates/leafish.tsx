import type { TemplateProps } from "./renderer";

// "Leafish" — compact, dense, two-column even when columns === "one".
// Designed to fit on one page even with a long work history.
export function Leafish({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "9px" : layout.fontSize === "large" ? "12px" : "10px";
  const color = layout.primaryColor;

  const Header = (
    <div className="mb-3 flex items-center justify-between gap-3 border-b-2 pb-2" style={{ borderColor: color }}>
      <div className="flex min-w-0 items-center gap-2.5">
        {layout.showPicture && data.personal.photo && (
          <img src={data.personal.photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" style={{ border: `2px solid ${color}` }} />
        )}
        <h1 className="truncate text-lg font-bold tracking-tight" style={{ color }}>{data.personal.name || "Your Name"}</h1>
      </div>
      <div className="shrink-0 text-right text-[10px] leading-tight text-muted-foreground">
        <div>{[data.personal.email, data.personal.phone].filter(Boolean).join(" · ")}</div>
        <div>{data.personal.location}</div>
        <div className="opacity-80">{[data.personal.linkedin, data.personal.github].filter(Boolean).join(" · ")}</div>
      </div>
    </div>
  );

  const Left = (
    <div>
      {data.personal.summary && (
        <section className="mb-3">
          <h2 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Summary</h2>
          <p className="text-xs leading-snug">{data.personal.summary}</p>
        </section>
      )}
      {data.skills.length > 0 && (
        <section className="mb-3">
          <h2 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Skills</h2>
          {data.skills.map((cat) => (
            <p key={cat.id} className="text-xs leading-snug">
              <span className="font-semibold">{cat.category}: </span>{cat.skills.join(", ")}
            </p>
          ))}
        </section>
      )}
      {data.education.length > 0 && (
        <section className="mb-3">
          <h2 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-1 text-xs">
              <div className="font-semibold">{edu.degree}{edu.field && `, ${edu.field}`}</div>
              <div className="text-muted-foreground">{edu.institution} · {edu.endDate}</div>
              {edu.gpa && <div className="text-muted-foreground">GPA {edu.gpa}</div>}
            </div>
          ))}
        </section>
      )}
      {data.certifications.length > 0 && (
        <section className="mb-3">
          <h2 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Certifications</h2>
          {data.certifications.map((cert) => (
            <p key={cert.id} className="text-xs leading-snug">
              <span className="font-semibold">{cert.name}</span>
              {cert.issuer && <span className="text-muted-foreground"> — {cert.issuer}</span>}
            </p>
          ))}
        </section>
      )}
      {data.languages.length > 0 && (
        <section className="mb-3">
          <h2 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Languages</h2>
          <p className="text-xs text-muted-foreground">
            {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}
          </p>
        </section>
      )}
    </div>
  );

  const Right = (
    <div>
      {data.experience.length > 0 && (
        <section className="mb-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold">{exp.position} · {exp.company}</span>
                <span className="text-[10px] text-muted-foreground">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
              </div>
              {exp.location && <div className="text-[10px] text-muted-foreground">{exp.location}</div>}
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-0.5 list-disc pl-3 text-xs leading-snug">
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
      {data.projects.length > 0 && (
        <section className="mb-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-1">
              <div className="text-xs font-semibold">{proj.name}</div>
              {proj.description && <div className="text-[10px] text-muted-foreground">{proj.description}</div>}
            </div>
          ))}
        </section>
      )}
    </div>
  );

  return (
    <div style={{ fontSize: fs }}>
      {Header}
      <div className="grid grid-cols-2 gap-4">{Left}{Right}</div>
    </div>
  );
}