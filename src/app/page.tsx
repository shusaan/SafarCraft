import Link from "next/link";
import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { BuiltForEngineers } from "@/components/marketing/built-for-engineers";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { REPO_URL } from "@/lib/external-urls";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

const HOME_TITLE = "SafarCraft — Free CV Maker & Resume Builder";

export const metadata: Metadata = {
  ...buildMetadata({
    title: HOME_TITLE,
    description:
      "Build a free CV or resume with SafarCraft, a private, open-source CV maker. Edit locally, review ATS guidance, and export PDF, DOCX, or JSON Resume without creating an account.",
    path: "/",
  }),
  // Absolute title: the homepage carries the brand directly.
  title: { absolute: HOME_TITLE },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        <Hero />
        <HowItWorks />
        <FeaturesGrid />
        <BuiltForEngineers />
        <PricingTeaser />
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
                Read the code, self-host it, contribute to it, or fork it. SafarCraft
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
