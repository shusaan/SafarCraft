"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/primitives/container";
import { trackEvent } from "@/engines/analytics";
import { BuilderPreview } from "@/components/marketing/builder-preview";

/**
 * Marketing hero — top-of-page conversion section.
 *
 * A product-led hero: direct value statement, clear entry points, and an
 * illustrative editor preview rather than decorative AI-style artwork.
 */
export function Hero() {
  return (
    <section className="border-b bg-[linear-gradient(115deg,var(--color-surface)_0%,var(--color-background)_58%,var(--color-surface-muted)_100%)]">
      <Container className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
        <div className="max-w-xl">
          <p className="text-primary mb-5 inline-flex items-center gap-2 text-sm font-semibold">
            <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" />
            Free to use · No account required
          </p>

          <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Free CV maker and resume builder. Your experience, clearly told.
          </h1>

          <p className="text-muted-foreground mt-5 max-w-lg text-base leading-relaxed text-pretty md:text-lg">
            Build a free CV or resume with SafarCraft. Your draft stays in your browser, and
            practical writing and ATS checks help you get it ready to send — no account, no
            watermark, no paywall.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="default"
              size="lg"
              onClick={() => trackEvent("marketing_cta_click", { location: "hero", cta: "import" })}
            >
              <Link href="/builder?onboarding=import">
                <FileText className="h-4 w-4" />
                Import a resume
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              onClick={() =>
                trackEvent("marketing_cta_click", { location: "hero", cta: "scratch" })
              }
            >
              <Link href="/onboarding/wizard">
                <PencilLine className="h-4 w-4" />
                Start a new resume
              </Link>
            </Button>
          </div>

          <ul
            aria-label="Trust signals"
            className="text-muted-foreground mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm"
          >
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="text-primary h-4 w-4" />
              <span>Private by default</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="text-primary h-4 w-4" />
              <span>8 resume templates</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="text-primary h-4 w-4" />
              <span>PDF, DOCX, and JSON exports</span>
            </li>
          </ul>
        </div>

        <div className="lg:pl-2">
          <BuilderPreview />
          <p className="text-muted-foreground mt-3 text-center text-xs">
            An example of the SafarCraft editor. Sample resume content shown.
          </p>
        </div>
      </Container>
    </section>
  );
}
