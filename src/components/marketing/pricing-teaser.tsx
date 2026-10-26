import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { SectionHeader } from "./section-header";
import { Button } from "@/components/ui/button";

const INCLUDED = [
  "Unlimited resumes and edits",
  "All 8 templates",
  "Writing helpers and practical ATS guidance",
  "PDF, DOCX, JSON Resume, and Markdown export",
  "Optional public share link",
  "Self-host with Docker (MIT license)",
];

export function PricingTeaser() {
  return (
    <Section background="muted">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title="Everything is free."
          description="No paid tier, no trial clock, no watermarks. SafarCraft is MIT-licensed — every feature is available to everyone."
          align="center"
        />

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="relative flex flex-col rounded-2xl border border-primary/40 bg-card p-8 shadow-sm ring-1 ring-primary/20">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">$0</span>
              <span className="text-sm text-muted-foreground">forever</span>
            </div>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {INCLUDED.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant="default"
              size="lg"
              className="mt-8 w-full"
            >
              <Link href="/onboarding?path=scratch">
                Start building — free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              If a paid option is ever added, the core builder stays free and
              this page will say exactly what changed.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
