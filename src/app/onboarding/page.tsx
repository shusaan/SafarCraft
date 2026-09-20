"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Wand2, ShieldCheck, Sparkles } from "lucide-react";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/engines/analytics";

/**
 * Onboarding branch page.
 *
 * Two large CTAs — "Import existing CV" and "Start from scratch" — with
 * a brief explanation of each. Forks to:
 *   - /onboarding?path=import → /builder (drops into Personal Info with
 *     the existing Import flow primed)
 *   - /onboarding?path=scratch → /onboarding/wizard (5-step guided builder)
 *
 * If no `?path=` is given (e.g. user navigated directly to /onboarding),
 * shows the two-card choice — identical to the landing-page two-track
 * block so the marketing site and onboarding are consistent.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    // No specific path chosen — this is the branch view itself.
    trackEvent("onboarding_path_chosen", { auto: true });
  }, []);

  return (
    <Section background="gradient" spacing="loose" className="min-h-[80vh] flex items-center">
      <Container size="narrow">
        <div className="text-center">
          <Badge variant="brand" className="mx-auto mb-5 gap-1.5">
            <Sparkles className="h-3 w-3" />
            Welcome — let's build your resume
          </Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Two ways in. Same great resume.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Already have a CV? Drop it in. Starting from scratch? The wizard
            takes about three minutes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <BranchCard
            icon={<FileText className="h-5 w-5" />}
            title="Import your existing CV"
            body="PDF or DOCX. We'll extract your info into an editable draft in seconds."
            bullets={[
              "Extracts every section",
              "Works with any layout",
              "Editable before you save",
            ]}
            cta="Import my CV"
            onClick={() => {
              trackEvent("onboarding_path_chosen", { path: "import" });
              router.push("/builder?onboarding=import");
            }}
            featured
          />
          <BranchCard
            icon={<Wand2 className="h-5 w-5" />}
            title="Start from scratch"
            body="A 5-step wizard. Personal, Experience, Education, Skills, Export."
            bullets={[
              "Step-by-step guidance",
              "Autosaves as you type",
              "8 ATS-tested templates",
            ]}
            cta="Start the wizard"
            onClick={() => {
              trackEvent("onboarding_path_chosen", { path: "scratch" });
              router.push("/onboarding/wizard");
            }}
          />
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/builder"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Skip and go straight to the builder →
          </Link>
        </div>
      </Container>
    </Section>
  );
}

function BranchCard({
  icon,
  title,
  body,
  bullets,
  cta,
  onClick,
  featured,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  bullets: string[];
  cta: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <Card
      className={
        "relative flex flex-col gap-4 p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl " +
        (featured ? "border-primary/40 bg-gradient-to-b from-primary/[0.06] to-transparent" : "")
      }
    >
      {featured && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Most popular
        </span>
      )}

      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-semibold leading-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <ul className="mt-2 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={featured ? "gradient" : "outline"}
        size="lg"
        className="mt-2 w-full"
        onClick={onClick}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}