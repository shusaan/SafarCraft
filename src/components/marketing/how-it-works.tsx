import { ArrowRight, Upload, Wand2, Download } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { SectionHeader } from "./section-header";

const STEPS = [
  {
    n: 1,
    title: "Drop in your CV",
    body: "Upload a PDF or DOCX. We extract every section into an editable draft.",
    icon: Upload,
  },
  {
    n: 2,
    title: "Tailor to the role",
    body: "Paste the job ad. We reorder skills and surface the bullets that match the role.",
    icon: Wand2,
  },
  {
    n: 3,
    title: "Export & ship",
    body: "Pick from 8 ATS-tested templates. Export to PDF, DOCX, or share via a public link.",
    icon: Download,
  },
];

export function HowItWorks() {
  return (
    <Section background="muted">
      <Container>
        <SectionHeader
          eyebrow="How it works"
          title="Three steps. About three minutes."
          description="No login, no setup wizard, no learning curve. Just your CV and a job ad."
          align="center"
        />

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="relative rounded-2xl border bg-background p-6 shadow-sm"
            >
              {/* Connector arrow (desktop only) */}
              {i < STEPS.length - 1 && (
                <ArrowRight
                  aria-hidden
                  className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 md:block"
                />
              )}

              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {s.n}
                </span>
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold leading-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
