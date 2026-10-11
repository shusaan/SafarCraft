"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/primitives/container";
import { trackEvent } from "@/engines/analytics";

/**
 * Marketing hero — top-of-page conversion section.
 *
 * Layout: badge pill → display headline (one line per phrase on desktop) →
 * supporting paragraph → two CTAs (primary gradient + secondary outline) →
 * trust strip (3 small social-proof statements).
 *
 * No real metrics in this milestone — stats ribbon (Phase 2.5) handles
 * numeric proof. The trust strip uses qualitative statements only.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-aurora">
      {/* Subtle background grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <Container className="relative pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow / brand pill */}
          <Badge variant="brand" className="mx-auto mb-6 gap-1.5">
            <Sparkles className="h-3 w-3" />
            MIT licensed · 100% free · No signup
          </Badge>

          {/* Display headline */}
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Build an{" "}
            <span className="whitespace-nowrap bg-gradient-hero bg-clip-text text-transparent">
              ATS-friendly
            </span>{" "}
            resume in minutes.
          </h1>

          {/* Supporting paragraph */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            A free, open-source resume builder for engineers. Local-first,
            AI-assisted when you want it, zero signup. Built so you can ship
            a job application today.
          </p>

          {/* Two-track CTA — matches /onboarding entry */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              variant="gradient"
              size="display-md"
              onClick={() => trackEvent("marketing_cta_click", { location: "hero", cta: "import" })}
            >
              <Link href="/onboarding?path=import">
                <FileText className="h-5 w-5" />
                Import my CV
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="glow"
              size="display-md"
              onClick={() => trackEvent("marketing_cta_click", { location: "hero", cta: "scratch" })}
            >
              <Link href="/onboarding?path=scratch">
                <Wand2 className="h-5 w-5" />
                Start from scratch
              </Link>
            </Button>
          </div>

          {/* Trust strip — qualitative (no fake numbers) */}
          <ul className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Your data stays in your browser</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>8 ATS-tested templates</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Export PDF, DOCX, JSON Resume</span>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
