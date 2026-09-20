import Link from "next/link";
import { GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/marketing/hero";
import { StatsRibbon } from "@/components/marketing/stats-ribbon";
import { TwoTrackEntry } from "@/components/marketing/two-track-entry";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { BuiltForEngineers } from "@/components/marketing/built-for-engineers";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { SocialProof } from "@/components/marketing/social-proof";
import { MarketingFooter } from "@/components/marketing/footer";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { REPO_URL } from "@/lib/external-urls";
import { ContinueDraft } from "@/components/marketing/continue-draft";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Sticky navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            CareerForge AI
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link href="/builder">
              <Button variant="ghost" size="sm">Builder</Button>
            </Link>
            <Link href="/builder?panel=templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                GitHub
              </Button>
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ContinueDraft />
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/onboarding?path=import">
                Start free
                <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Hero />
        <StatsRibbon />
        <TwoTrackEntry />
        <HowItWorks />
        <FeaturesGrid />
        <BuiltForEngineers />
        <PricingTeaser />
        <SocialProof />

        {/* ── Open source trust card ── */}
        <Section background="muted">
          <Container size="narrow">
            <div className="rounded-2xl border bg-card p-8 text-center shadow-sm md:p-12">
              <div
                className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border bg-background"
                aria-hidden="true"
              >
                <GitBranch className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Fully open source — MIT licensed
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                Read the code, self-host it, contribute to it, or fork it. CareerForge AI
                is built in the open. No vendor lock-in, no paywalls, no data sold.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="gradient" size="lg">
                  <Link href="/onboarding?path=scratch">
                    Start for free
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                    Star on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <MarketingFooter />
    </div>
  );
}