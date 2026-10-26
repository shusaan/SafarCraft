import Link from "next/link";
import { Route, GitBranch } from "lucide-react";
import { Container } from "@/components/primitives/container";
import { REPO_URL, REPO_CONTRIBUTING_URL } from "@/lib/external-urls";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Builder", href: "/builder" },
      { label: "Templates", href: "/builder?panel=templates" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "ATS tips", href: "/blog/ats-friendly-resume-format-2026" },
      { label: "JSON Resume", href: "/blog/json-resume-standard-explained" },
      { label: "Contributing", href: REPO_CONTRIBUTING_URL },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "License (MIT)", href: REPO_URL },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Route className="h-4 w-4" />
              </span>
              <span className="font-semibold">SafarCraft</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              A free, open-source resume builder. Private by default — your
              resume is edited and stored in your browser.
            </p>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground/80">
              Safar (سفر) means “journey” in Urdu. SafarCraft helps you craft
              the next step of yours.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
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
            © {new Date().getFullYear()} SafarCraft · Open source under MIT.
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
