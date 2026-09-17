import type { TemplateProps } from "./renderer";
import { DateRange } from "./renderer";

// "Onyx" — dark sidebar on the left with profile + skills, main content on the right.
export function Onyx({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "10px" : layout.fontSize === "large" ? "13px" : "11px";
  const color = layout.primaryColor;

  const Left = (
    <aside className="rounded-md p-3" style={{ backgroundColor: color, color: "#fff" }}>
      {layout.showPicture && data.personal.photo && (
        <img src={data.personal.photo} alt="" className="mx-auto mb-3 h-20 w-20 rounded-full border-2 border-white object-cover" />
      )}
      <h1 className="text-base font-bold leading-tight">{data.personal.name || "Your Name"}</h1>
      <div className="mt-2 space-y-1 text-xs opacity-90">
        {data.personal.email && <div>{data.personal.email}</div>}
        {data.personal.phone && <div>{data.personal.phone}</div>}
        {data.personal.location && <div>{data.personal.location}</div>}
        {data.personal.linkedin && <div>{data.personal.linkedin}</div>}
        {data.personal.github && <div>{data.personal.github}</div>}
        {data.personal.website && <div>{data.personal.website}</div>}
      </div>

      {data.skills.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest">Skills</h2>
          <div className="space-y-1">
            {data.skills.map((cat) => (
              <div key={cat.id}>
                <p className="text-[10px] font-semibold uppercase opacity-90">{cat.category}</p>
                <p className="text-xs opacity-95">{cat.skills.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.languages.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest">Languages</h2>
          <p className="text-xs opacity-95">
            {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(" · ")}
          </p>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest">Certifications</h2>
          {data.certifications.map((cert) => (
            <p key={cert.id} className="text-xs opacity-95">
              <span className="font-semibold">{cert.name}</span>
              {cert.issuer && <span className="opacity-90"> — {cert.issuer}</span>}
            </p>
          ))}
        </div>
      )}
    </aside>
  );

  const Right = (
    <div>
      {data.personal.summary && (
        <section className="mb-4">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color }}>Summary</h2>
          <p className="text-xs leading-relaxed">{data.personal.summary}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color }}>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold">{exp.position}</span>
                  <span className="text-xs"> · {exp.company}</span>
                </div>
                <DateRange start={exp.startDate} end={exp.endDate} current={exp.current} />
              </div>
              {exp.location && <p className="text-xs text-muted-foreground">{exp.location}</p>}
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color }}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold">{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                  <span className="text-xs text-muted-foreground"> — {edu.institution}</span>
                </div>
                <DateRange start={edu.startDate} end={edu.endDate} />
              </div>
              {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color }}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <span className="text-xs font-bold">{proj.name}</span>
              {proj.role && <span className="text-xs text-muted-foreground"> — {proj.role}</span>}
              {proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );

  return (
    <div style={{ fontSize: fs, display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
      {Left}{Right}
    </div>
  );
}