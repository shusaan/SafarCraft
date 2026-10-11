import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { SectionHeader } from "./section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Everything you need to ship a job application today.",
    features: [
      "Unlimited PDF / DOCX / JSON Resume downloads",
      "All 8 templates",
      "ATS scoring + JD tailoring",
      "Share link",
    ],
    cta: "Start free",
    href: "/onboarding?path=scratch",
    featured: true,
  },
  {
    name: "Pro",
    price: "$5",
    period: "per month",
    badge: "Coming soon",
    blurb: "Cloud sync, AI rewriting, premium templates. $48/yr saves 20%.",
    features: [
      "Cloud sync across devices",
      "AI rewrite (BYOK)",
      "25+ premium templates",
      "Custom-domain share link",
    ],
    cta: "Join the waitlist",
    href: "/blog",
    disabled: true,
  },
];

export function PricingTeaser() {
  return (
    <Section background="gradient">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title="Free forever. Pro when you need it."
          description="No credit card, no trial clock, no surprise charges. The whole builder is free; Pro adds conveniences for active job hunters."
          align="center"
        />

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={
                "relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm " +
                (t.featured ? "border-primary/50 ring-1 ring-primary/20" : "")
              }
            >
              {t.badge && (
                <Badge variant="brand" className="absolute -top-3 right-6">
                  <Sparkles className="h-3 w-3" />
                  {t.badge}
                </Badge>
              )}

              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>

              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={t.featured ? "gradient" : "outline"}
                size="lg"
                className="mt-8 w-full"
                disabled={t.disabled}
              >
                <Link href={t.href}>
                  {t.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
