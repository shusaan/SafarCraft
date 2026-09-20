import {
  BoxesIcon,
  GitBranch,
  LayoutTemplate,
  Share2,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  icon: typeof BoxesIcon;
  highlight?: boolean;
}

const FEATURES: Feature[] = [
  {
    title: "ATS-tested templates",
    description:
      "Eight layouts, each verified against Workday, Greenhouse, and Lever parsers.",
    icon: LayoutTemplate,
    highlight: true,
  },
  {
    title: "JD-tailored bullets",
    description:
      "Paste a job ad. We reorder your skills and surface the bullets that match.",
    icon: Wand2,
  },
  {
    title: "5-axis ATS scoring",
    description:
      "Real, deterministic scoring across Content, Format, ATS, Brevity, and Impact.",
    icon: BoxesIcon,
  },
  {
    title: "Import any PDF or DOCX",
    description:
      "Drop in your existing CV. We extract your data into an editable draft in seconds.",
    icon: GitBranch,
  },
  {
    title: "JSON Resume standard",
    description:
      "Round-trip with the open schema. Your data follows you to any other tool.",
    icon: Share2,
  },
  {
    title: "100% local-first",
    description:
      "Your resume never leaves the browser unless you choose to share or export it.",
    icon: ShieldCheck,
    highlight: true,
  },
];

export function FeaturesGrid() {
  return (
    <Section background="default">
      <Container>
        <SectionHeader
          eyebrow="What's inside"
          title="Everything you need to ship a resume today."
          description="No account, no upsell wall, no watermarks — just the tools engineers actually use."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className={cn(
                "group relative rounded-xl border bg-card p-6 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
                f.highlight && "border-primary/30 bg-gradient-to-b from-primary/[0.04] to-transparent",
              )}
            >
              <div
                className={cn(
                  "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg",
                  f.highlight
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold leading-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
