"use client";

import Link from "next/link";
import { Sparkles, GitBranch, Send } from "lucide-react";
import { Container } from "@/components/primitives/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REPO_URL, REPO_CONTRIBUTING_URL } from "@/lib/external-urls";
import { useState } from "react";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Builder", href: "/builder" },
      { label: "Templates", href: "/builder?panel=templates" },
      { label: "Pricing", href: "/blog" },
      { label: "Changelog", href: "/blog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "ATS tips", href: "/blog/ats-friendly-resume-format-2026" },
      { label: "JSON Resume", href: "/blog/json-resume-standard-explained" },
      { label: "Contributing", href: REPO_CONTRIBUTING_URL },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs Resume.io", href: "/blog" },
      { label: "vs FlowCV", href: "/blog" },
      { label: "vs Enhancv", href: "/blog" },
      { label: "vs Canva", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/blog" },
      { label: "License (MIT)", href: REPO_URL },
    ],
  },
];

export function MarketingFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="border-t bg-muted/20">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Brand + newsletter */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-semibold">CareerForge AI</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              The MIT-licensed resume builder for engineers. 100% local-first,
              no signup, free forever.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO(newsletter-provider): wire to actual provider.
                setSubmitted(true);
              }}
              className="mt-6 flex max-w-sm gap-2"
            >
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email for newsletter"
              />
              <Button type="submit" variant="gradient" size="default">
                <Send className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
            {submitted && (
              <p className="mt-2 text-xs text-success">
                Thanks! We&apos;ll be in touch when Pro launches.
              </p>
            )}
            <p className="mt-1 text-[10px] text-muted-foreground/70">
              {/* TODO(newsletter-provider): wire to actual provider. */}
              Newsletter signup is currently a no-op demo.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CareerForge AI · Open source under MIT.
          </p>
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitBranch className="h-4 w-4" />
            View on GitHub
          </Link>
        </div>
      </Container>
    </footer>
  );
}
