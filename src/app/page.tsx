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
import { faqLd } from "@/lib/seo/jsonld";
import { HOME_FAQS } from "@/data/home-faqs";
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
        <script type="application/ld+json" dangerouslySetInnerHTML={faqLd(HOME_FAQS)} />
        <Hero />
        <HowItWorks />
        <FeaturesGrid />
        <BuiltForEngineers />
        <Section aria-labelledby="home-faq-heading">
          <Container size="narrow">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="home-faq-heading"
                className="text-3xl font-semibold tracking-tight md:text-4xl"
              >
                Free CV maker and resume builder questions
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">
                What you can expect from SafarCraft before you start writing.
              </p>
            </div>
            <dl className="mt-10 grid gap-4 md:grid-cols-2">
              {HOME_FAQS.map((faq) => (
                <div key={faq.q} className="bg-card rounded-xl border p-5">
                  <dt className="text-base font-semibold">{faq.q}</dt>
                  <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">{faq.a}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
              <Link
                href="/free-cv-maker"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Free CV maker guide
              </Link>
              <Link
                href="/templates"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Free resume templates
              </Link>
              <Link
                href="/ats-cv-checker"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                ATS CV checker
              </Link>
            </div>
          </Container>
        </Section>
        <PricingTeaser />
        {/* ── Open source trust card ── */}
        <Section background="muted">
          <Container size="narrow">
            <div className="bg-card rounded-2xl border p-8 text-center shadow-sm md:p-12">
              <div
                className="bg-background mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border"
                aria-hidden="true"
              >
                <GitBranch className="text-muted-foreground h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Fully open source — MIT licensed
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base leading-relaxed">
                Read the code, self-host it, contribute to it, or fork it. SafarCraft is built in
                the open. No vendor lock-in, no paywalls, no data sold.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="gradient" size="lg">
                  <Link href="/onboarding">Start for free</Link>
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
