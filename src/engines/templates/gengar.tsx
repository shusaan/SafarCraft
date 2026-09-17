import type { TemplateProps } from "./renderer";

// "Gengar" — dark, themed resume. Black bg with vivid accent color.
export function Gengar({ data, layout }: TemplateProps) {
  const fs = layout.fontSize === "small" ? "10px" : layout.fontSize === "large" ? "13px" : "11px";
  const color = layout.primaryColor;

  return (
    <div
      style={{
        fontSize: fs,
        backgroundColor: "#0f0f12",
        color: "#e5e7eb",
        padding: "16px",
        borderRadius: "6px",
      }}
    >
      <div className="mb-4 flex items-start gap-4">
        {layout.showPicture && data.personal.photo && (
          <img src={data.personal.photo} alt="" className="h-16 w-16 rounded-full object-cover" style={{ border: `2px solid ${color}` }} />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color }}>{data.personal.name || "Your Name"}</h1>
          <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>
            {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join("  ·  ")}
          </p>
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            {[data.personal.linkedin, data.personal.github, data.personal.website].filter(Boolean).join("  ·  ")}
          </p>
        </div>
      </div>

      {data.personal.summary && (
        <p className="mb-4 rounded border-l-4 px-3 py-2 text-xs italic leading-relaxed" style={{ borderColor: color, backgroundColor: "rgba(255,255,255,0.04)" }}>
          {data.personal.summary}
        </p>
      )}

      {data.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest" style={{ color }}>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold" style={{ color: "#fff" }}>{exp.position}</span>
                  <span className="text-xs"> at {exp.company}</span>
                </div>
                <span className="text-xs" style={{ color: "#9ca3af" }}>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-3 text-xs">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="relative pl-3 before:absolute before:left-0 before:text-white" style={{ color: "#d1d5db" }}>
                      <span className="absolute left-0" style={{ color }}>▸</span>
                      {b}
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
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest" style={{ color }}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs font-bold" style={{ color: "#fff" }}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                  <span className="text-xs"> — {edu.institution}</span>
                </div>
                <span className="text-xs" style={{ color: "#9ca3af" }}>{edu.startDate} – {edu.endDate}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest" style={{ color }}>Skills</h2>
          {data.skills.map((cat) => (
            <div key={cat.id} className="mb-1">
              <p className="text-[10px] font-semibold uppercase" style={{ color }}>{cat.category}</p>
              <p className="text-xs">{cat.skills.join(" · ")}</p>
            </div>
          ))}
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest" style={{ color }}>Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <span className="text-xs font-bold" style={{ color: "#fff" }}>{proj.name}</span>
              {proj.role && <span className="text-xs"> — {proj.role}</span>}
              {proj.description && <p className="text-xs" style={{ color: "#d1d5db" }}>{proj.description}</p>}
            </div>
          ))}
        </section>
      )}

      {data.languages.length > 0 && (
        <section className="mb-2">
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest" style={{ color }}>Languages</h2>
          <p className="text-xs">{data.languages.map((l) => `${l.language} (${l.proficiency})`).join(" · ")}</p>
        </section>
      )}
    </div>
  );
}