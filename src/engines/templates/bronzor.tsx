import type { TemplateProps } from "./renderer";
import { DateRange } from "./renderer";

// "Bronzor" — sidebar on the left with photo + contact, soft color blocks.
export function Bronzor({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "10px" : layout.fontSize === "large" ? "13px" : "11px";
  const color = layout.primaryColor;

  return (
    <div style={{ fontSize: fs, display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
      <aside>
        {layout.showPicture && data.personal.photo ? (
          <img src={data.personal.photo} alt="" className="mb-3 w-full rounded-md object-cover" />
        ) : (
          <div className="mb-3 aspect-square w-full rounded-md" style={{ backgroundColor: color, opacity: 0.15 }} />
        )}
        <h1 className="text-xl font-bold leading-tight" style={{ color }}>{data.personal.name || "Your Name"}</h1>
        <div className="mt-2 space-y-0.5 text-xs">
          {data.personal.email && <p className="break-all">{data.personal.email}</p>}
          {data.personal.phone && <p>{data.personal.phone}</p>}
          {data.personal.location && <p>{data.personal.location}</p>}
          {data.personal.linkedin && <p className="break-all">{data.personal.linkedin}</p>}
          {data.personal.github && <p className="break-all">{data.personal.github}</p>}
          {data.personal.website && <p className="break-all">{data.personal.website}</p>}
        </div>

        {data.skills.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              Skills
            </h2>
            <div className="space-y-1">
              {data.skills.map((cat) => (
                <div key={cat.id}>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{cat.category}</p>
                  <p className="text-xs">{cat.skills.join(", ")}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.languages.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              Languages
            </h2>
            <p className="text-xs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}
            </p>
          </section>
        )}

        {data.certifications.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              Certifications
            </h2>
            {data.certifications.map((cert) => (
              <p key={cert.id} className="text-xs">
                <span className="font-semibold">{cert.name}</span>
                {cert.issuer && <span className="text-muted-foreground"> — {cert.issuer}</span>}
              </p>
            ))}
          </section>
        )}
      </aside>

      <main>
        {data.personal.summary && (
          <section className="mb-3">
            <h2 className="mb-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              Profile
            </h2>
            <p className="text-xs leading-relaxed">{data.personal.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-3">
            <h2 className="mb-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              Experience
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold">{exp.position}</span>
                    <span className="text-xs"> — {exp.company}</span>
                  </div>
                  <DateRange start={exp.startDate} end={exp.endDate} current={exp.current} />
                </div>
                {exp.location && <p className="text-xs text-muted-foreground">{exp.location}</p>}
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                    {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {data.education.length > 0 && (
          <section className="mb-3">
            <h2 className="mb-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              Education
            </h2>
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
          <section className="mb-3">
            <h2 className="mb-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
              Projects
            </h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-2">
                <div className="text-xs font-bold">{proj.name}</div>
                {proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}