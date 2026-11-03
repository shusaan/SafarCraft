import Link from "next/link";
import { Route, GitBranch } from "lucide-react";
import { Container } from "@/components/primitives/container";
import { REPO_URL, REPO_CONTRIBUTING_URL } from "@/lib/external-urls";

const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "Free CV Maker & Resume Builder", href: "/free-cv-maker" },
      { label: "Builder", href: "/builder" },
      { label: "Resume Templates", href: "/templates" },
      { label: "ATS Checker", href: "/ats-cv-checker" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "CV templates guide", href: "/cv-templates" },
      { label: "Alternatives", href: "/alternatives" },
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
    <footer className="bg-muted/20 border-t">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Brand */}
          <div>
            <Link href="/" className="text-foreground inline-flex items-center gap-2">
              <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg">
                <Route className="h-4 w-4" />
              </span>
              <span className="font-semibold">SafarCraft</span>
            </Link>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm">
              A free CV maker and resume builder, open source and private by default — your resume
              is edited and stored in your browser.
            </p>
            <p className="text-muted-foreground mt-2 max-w-sm text-xs">
              Safar (سفر) means “journey” in Urdu. SafarCraft helps you craft the next step of
              yours.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-foreground/80 hover:text-foreground text-sm transition-colors"
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
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} SafarCraft · Open source under MIT.
          </p>
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <GitBranch className="h-4 w-4" />
            View on GitHub
          </Link>
        </div>
      </Container>
    </footer>
  );
}
