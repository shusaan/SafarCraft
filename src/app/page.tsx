import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuilderPreview } from "@/components/marketing/builder-preview";
import {
  ArrowRight,
  Github,
  FileText,
  Target,
  Bot,
  Download,
  GitBranch,
  Palette,
  CheckCircle,
  Star,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description:
      "Real-time editing, drag-and-drop sections, live preview, autosave, and full version history — all in one flow.",
  },
  {
    icon: Target,
    title: "ATS Analysis",
    description:
      "Detailed ATS scoring with per-deduction explanations and actionable recommendations to push past 90.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Improve bullets, rewrite summaries, fix grammar, and generate stronger action verbs with a single click.",
  },
  {
    icon: GitBranch,
    title: "GitHub Intelligence",
    description:
      "Import your GitHub profile and auto-generate contribution bullets, project sections, and skill lists.",
  },
  {
    icon: Download,
    title: "Multiple Exports",
    description:
      "Export to PDF, DOCX, JSON Resume, and Markdown — all ATS compliant and ready to send.",
  },
  {
    icon: Palette,
    title: "Professional Templates",
    description:
      "Classic ATS, Modern Professional, Executive — with column layout and picture options per template.",
  },
];

const steps = [
  {
    number: "01",
    title: "Fill in your details",
    description:
      "Start from a pre-filled sample or paste in your existing experience. No account required.",
  },
  {
    number: "02",
    title: "Analyse & optimise",
    description:
      "Run ATS analysis, let AI improve your bullets, and match against job descriptions.",
  },
  {
    number: "03",
    title: "Export & apply",
    description:
      "Download a pixel-perfect PDF or DOCX, or generate a portfolio site — in one click.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight">CareerForge AI</span>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link href="/builder">
              <Button variant="ghost" size="sm">Builder</Button>
            </Link>
            <Link href="/builder?panel=templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <a
              href="https://github.com/yourusername/careerforge-ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Github className="h-3.5 w-3.5" />
                GitHub
              </Button>
            </a>
          </nav>

          <Link href="/builder">
            <Button size="sm" className="gap-1.5">
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="px-4 pt-20 pb-16 sm:px-6 sm:pb-20 sm:pt-24" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                MIT licensed &middot; No signup required
              </div>

              <h1
                id="hero-heading"
                className="animate-fade-up delay-100 text-4xl font-extrabold tracking-tight sm:text-5xl"
              >
                Build resumes that{" "}
                <span className="text-primary">beat the ATS</span>
              </h1>

              <p className="animate-fade-up delay-200 mx-auto mt-5 max-w-xl text-base text-muted-foreground leading-relaxed">
                Open-source resume platform for software engineers. Real-time editing, AI assistance,
                GitHub intelligence, and ATS analysis — all free, all yours.
              </p>

              <div className="animate-fade-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/builder">
                  <Button size="lg" className="gap-2">
                    <Zap className="h-4 w-4" />
                    Start building free
                  </Button>
                </Link>
                <a
                  href="https://github.com/yourusername/careerforge-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="gap-2">
                    <Github className="h-4 w-4" />
                    View on GitHub
                    <Badge variant="secondary" className="ml-0.5 text-xs">MIT</Badge>
                  </Button>
                </a>
              </div>

              <p className="animate-fade-up delay-400 mt-4 text-xs text-muted-foreground">
                Your data stays on your device — no account, no cloud, no tracking
              </p>
            </div>

            <div className="animate-fade-up delay-500 mt-12">
              <BuilderPreview />
              <p className="mt-2 text-center text-xs text-muted-foreground/60">
                The resume builder — real-time editor with live ATS scoring
              </p>
            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section className="border-y bg-muted/20" aria-label="Trust signals">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
            <p className="text-center text-xs text-muted-foreground tracking-wide">
              <span className="font-medium text-foreground">MIT licensed</span>
              <span aria-hidden="true" className="mx-2 text-muted-foreground/30">&middot;</span>
              No signup or account required
              <span aria-hidden="true" className="mx-2 text-muted-foreground/30">&middot;</span>
              Self-hostable with Docker
              <span aria-hidden="true" className="mx-2 text-muted-foreground/30">&middot;</span>
              95+ Lighthouse score
              <span aria-hidden="true" className="mx-2 text-muted-foreground/30">&middot;</span>
              Data stays on your device
            </p>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-4 py-20 sm:px-6 sm:py-24" aria-labelledby="features-heading">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2
                id="features-heading"
                className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Built for engineers
              </h2>
              <p className="animate-fade-up delay-100 mt-4 text-muted-foreground leading-relaxed">
                Every feature is designed around the real workflow of a software engineer applying for jobs.
              </p>
            </div>

            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-border rounded-lg overflow-hidden border">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className={`animate-fade-up delay-${(i % 6) * 100 + 100} bg-background p-6 sm:p-7`}
                  >
                    <div
                      className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="border-y bg-muted/20 px-4 py-20 sm:px-6 sm:py-24" aria-labelledby="how-heading">
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2
                id="how-heading"
                className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                From blank to hired in three steps
              </h2>
            </div>

            <ol className="grid gap-8 sm:grid-cols-3" aria-label="Steps">
              {steps.map((step, i) => (
                <li
                  key={step.number}
                  className={`animate-fade-up delay-${i * 200 + 100} relative text-center`}
                >
                  <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-sm font-bold text-primary">
                    {step.number}
                  </div>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Open source trust ── */}
        <section className="px-4 py-20 sm:px-6 sm:py-24" aria-labelledby="oss-heading">
          <div className="mx-auto max-w-3xl">
            <div className="animate-fade-up rounded-lg border bg-card p-8 sm:p-10 text-center shadow-sm">
              <div
                className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border bg-background"
                aria-hidden="true"
              >
                <Github className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2
                id="oss-heading"
                className="text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                Fully open source — MIT Licensed
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed">
                Read the code, self-host it, contribute to it, or fork it. CareerForge AI is built
                in the open. No vendor lock-in, no paywalls, no data sold.
              </p>
              <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
                {[
                  "No account required",
                  "Data stays on your device",
                  "No analytics without consent",
                  "Self-hostable",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/builder">
                  <Button size="lg" className="gap-2">
                    <Zap className="h-4 w-4" />
                    Start for free
                  </Button>
                </Link>
                <a
                  href="https://github.com/yourusername/careerforge-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="gap-2">
                    <Star className="h-4 w-4" />
                    Star on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t" role="contentinfo">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">CareerForge AI</span>
              <Badge variant="outline" className="text-xs">MIT</Badge>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground" aria-label="Footer navigation">
              <Link href="/builder" className="hover:text-foreground transition-colors">
                Builder
              </Link>
              <Link href="/builder?panel=templates" className="hover:text-foreground transition-colors">
                Templates
              </Link>
              <a
                href="https://github.com/yourusername/careerforge-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/yourusername/careerforge-ai/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Contributing
              </a>
            </nav>

            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CareerForge AI &mdash; Open source. Free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
