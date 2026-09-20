"use client";

import Link from "next/link";
import { ArrowRight, FileText, Wand2, Check } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { SectionHeader } from "./section-header";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/engines/analytics";
import { cn } from "@/lib/utils";

/**
 * Two-track entry CTA — the central decision on the landing page.
 *
 * Matches `/onboarding` exactly so users who scroll past the hero get the
 * same choice whether they came from the hero CTAs or scrolled to here.
 */
export function TwoTrackEntry() {
  return (
    <Section background="default">
      <Container>
        <SectionHeader
          eyebrow="Get started"
          title="Two ways in. Same great resume."
          description="Already have a CV? Drop it in. Starting from scratch? The wizard takes about three minutes."
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <EntryCard
            icon={<FileText className="h-5 w-5" />}
            title="Import your existing CV"
            body="PDF or DOCX. We'll extract your info into an editable draft."
            bullets={[
              "Extracts every section",
              "Works with any layout",
              "Editable before you save",
            ]}
            cta="Import my CV"
            href="/onboarding?path=import"
            ctaKey="import"
            featured
          />
          <EntryCard
            icon={<Wand2 className="h-5 w-5" />}
            title="Start from scratch"
            body="A 5-step wizard. Personal, Experience, Education, Skills, Export."
            bullets={[
              "Step-by-step guidance",
              "Autosaves as you type",
              "8 ATS-tested templates",
            ]}
            cta="Start the wizard"
            href="/onboarding?path=scratch"
            ctaKey="scratch"
          />
        </div>
      </Container>
    </Section>
  );
}

interface EntryCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
  href: string;
  ctaKey: "import" | "scratch";
  featured?: boolean;
}

function EntryCard({ icon, title, body, bullets, cta, href, ctaKey, featured }: EntryCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl",
        featured
          ? "border-primary/40 bg-gradient-to-b from-primary/[0.06] to-transparent"
          : "border-border",
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Most popular
        </span>
      )}

      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>

      <ul className="mt-5 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={featured ? "gradient" : "outline"}
        size="lg"
        className="mt-6 w-full"
        onClick={() => trackEvent("marketing_cta_click", { location: "two-track", cta: ctaKey })}
      >
        <Link href={href}>
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
