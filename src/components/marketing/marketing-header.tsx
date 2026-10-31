"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, Menu, Route, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/primitives/container";
import { ContinueDraft } from "@/components/marketing/continue-draft";
import { REPO_URL } from "@/lib/external-urls";

const NAV_LINKS = [
  { label: "Free CV Maker", href: "/free-cv-maker" },
  { label: "Builder", href: "/builder" },
  { label: "Templates", href: "/templates" },
  { label: "ATS Checker", href: "/ats-cv-checker" },
  { label: "Blog", href: "/blog" },
];

/**
 * Shared marketing header. Renders the desktop nav plus an accessible mobile
 * menu — the previous landing header hid all links below `md` with no way to
 * reach Templates, the CV landing page, or the repo.
 */
export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Route className="h-4 w-4" />
          </span>
          SafarCraft
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm">
                {link.label}
              </Button>
            </Link>
          ))}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              GitHub
            </Button>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ContinueDraft />
          <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Link href="/onboarding?path=import">
              Build a resume
              <span aria-hidden>→</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Toggle menu"}
            aria-expanded={open}
            aria-controls="mobile-marketing-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {open ? (
          <div className="absolute left-0 right-0 top-14 border-b bg-background md:hidden">
            <nav
              id="mobile-marketing-nav"
              aria-label="Mobile navigation menu"
              className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <GitBranch className="h-4 w-4" />
                GitHub
              </a>
              <Button asChild className="mt-2">
                <Link href="/onboarding?path=import" onClick={() => setOpen(false)}>
                  Build a resume
                  <span aria-hidden>→</span>
                </Link>
              </Button>
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
