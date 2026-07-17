import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisitorCounter } from "@/components/analytics/visitor-counter";
import {
  ArrowRight,
  Github,
  Sparkles,
  Shield,
  Zap,
  CheckCircle,
  Star,
  FileText,
  Target,
  Bot,
  Download,
  GitBranch,
  Palette,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Feature data
───────────────────────────────────────────── */
const features = [
  {
    icon: FileText,
    color: "from-violet-500 to-indigo-500",
    title: "Smart Resume Builder",
    description:
      "Real-time editing, drag-and-drop sections, live preview, autosave, and full version history — all in one flow.",
  },
  {
    icon: Target,
    color: "from-indigo-500 to-blue-500",
    title: "ATS Analysis",
    description:
      "Detailed ATS scoring with per-deduction explanations and actionable recommendations to push past 90.",
  },
  {
    icon: Bot,
    color: "from-violet-500 to-purple-500",
    title: "AI Assistant",
    description:
      "Improve bullets, rewrite summaries, fix grammar, and generate stronger action verbs with a single click.",
  },
  {
    icon: GitBranch,
    color: "from-blue-500 to-cyan-500",
    title: "GitHub Intelligence",
    description:
      "Import your GitHub profile and auto-generate contribution bullets, project sections, and skill lists.",
  },
  {
    icon: Download,
    color: "from-cyan-500 to-teal-500",
    title: "Multiple Exports",
    description:
      "Export to PDF, DOCX, JSON Resume, and Markdown — all ATS compliant and ready to send.",
  },
  {
    icon: Palette,
    color: "from-teal-500 to-violet-500",
    title: "Professional Templates",
    description:
      "Classic ATS, Modern Professional, Executive — with column layout and picture options per template.",
  },
];

/* ─────────────────────────────────────────────
   How it works
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Stats
───────────────────────────────────────────── */
const stats = [
  { value: "100%", label: "Free forever" },
  { value: "MIT", label: "Open source" },
  { value: "0", label: "Accounts needed" },
  { value: "95+", label: "Lighthouse score" },
];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="glass sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">CareerForge AI</span>
            <VisitorCounter />
          </div>

          {/* Nav links */}
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

          {/* CTA */}
          <Link href="/builder">
            <Button
              size="sm"
              className="btn-glow gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
            >
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8"
          style={{ background: "var(--gradient-hero)" }}
          aria-labelledby="hero-heading"
        >
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-400/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-indigo-400/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-4xl text-center">
            {/* Pill badge */}
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              No signup required — start building immediately
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="animate-fade-up delay-100 text-5xl font-bold tracking-tight sm:text-7xl"
            >
              Build resumes that{" "}
              <span className="gradient-text">beat the ATS</span>
            </h1>

            {/* Sub */}
            <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Open-source resume platform for software engineers. Real-time editing, AI assistance,
              GitHub intelligence, and ATS analysis — all free, all yours.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/builder">
                <Button
                  size="lg"
                  className="btn-glow gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:from-violet-700 hover:to-indigo-700"
                >
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
                  <Badge variant="secondary" className="ml-1 text-xs">MIT</Badge>
                </Button>
              </a>
            </div>

            <p className="animate-fade-up delay-400 mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Your data stays on your device — no account, no cloud, no tracking
            </p>

            {/* Hero mockup card */}
            <div className="animate-fade-up delay-500 animate-float mt-16">
              <div className="glass mx-auto max-w-3xl overflow-hidden rounded-2xl border shadow-2xl">
                {/* Mock browser chrome */}
                <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 rounded-md bg-background/60 px-3 py-1 text-center text-xs text-muted-foreground">
                    careerforge.ai/builder
                  </div>
                </div>

                {/* Mock builder UI */}
                <div className="flex h-64 divide-x bg-background/60">
                  {/* Sidebar */}
                  <div className="w-36 shrink-0 space-y-1 p-3">
                    {["Personal Info", "Experience", "Education", "Skills", "Projects"].map(
                      (item, i) => (
                        <div
                          key={item}
                          className={`rounded-md px-2 py-1.5 text-xs ${
                            i === 1
                              ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>

                  {/* Editor area */}
                  <div className="flex-1 space-y-3 p-4">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                    <div className="mt-4 h-3 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                    <div className="h-3 w-3/5 rounded bg-muted" />
                    <div className="mt-4 flex gap-2">
                      <div className="h-6 w-20 rounded-md bg-gradient-to-r from-violet-500 to-indigo-500" />
                      <div className="h-6 w-16 rounded-md bg-muted" />
                    </div>
                  </div>

                  {/* Preview area */}
                  <div className="w-44 shrink-0 space-y-2 p-4">
                    <div className="h-4 w-24 rounded bg-foreground/10 mx-auto" />
                    <div className="h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-5/6 rounded bg-muted" />
                    <div className="mt-3 h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-4/5 rounded bg-muted" />
                    <div className="h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-3/4 rounded bg-muted" />
                    <div className="mt-3 h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-5/6 rounded bg-muted" />
                  </div>
                </div>

                {/* ATS score bar at bottom */}
                <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">ATS Score</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                    </div>
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">87</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="border-y bg-muted/30" aria-label="Product statistics">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`animate-fade-up text-center delay-${i * 100 + 100}`}
                >
                  <dt className="text-3xl font-bold gradient-text">{stat.value}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge variant="outline" className="mb-4 border-violet-300 text-violet-600 dark:text-violet-400">
                Everything you need
              </Badge>
              <h2
                id="features-heading"
                className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Built for engineers,{" "}
                <span className="gradient-text">by engineers</span>
              </h2>
              <p className="animate-fade-up delay-100 mt-4 text-muted-foreground">
                Every feature is designed around the real workflow of a software engineer applying for jobs.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className={`animate-fade-up delay-${i * 100 + 100} group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10`}
                  >
                    <div
                      className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-sm`}
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section
          className="border-y bg-muted/20 px-4 py-24 sm:px-6 lg:px-8"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge variant="outline" className="mb-4 border-violet-300 text-violet-600 dark:text-violet-400">
                Simple workflow
              </Badge>
              <h2
                id="how-heading"
                className="animate-fade-up text-3xl font-bold tracking-tight sm:text-4xl"
              >
                From blank to hired in{" "}
                <span className="gradient-text">three steps</span>
              </h2>
            </div>

            <ol className="relative grid gap-10 sm:grid-cols-3" aria-label="Steps">
              {/* Connecting line on desktop */}
              <div
                aria-hidden="true"
                className="absolute left-1/6 right-1/6 top-6 hidden h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent sm:block dark:via-violet-700"
              />
              {steps.map((step, i) => (
                <li
                  key={step.number}
                  className={`animate-fade-up delay-${i * 200 + 100} relative flex flex-col items-center text-center`}
                >
                  <div className="animate-pulse-glow mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Open source trust ── */}
        <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="oss-heading">
          <div className="mx-auto max-w-3xl">
            <div className="animate-fade-up glass rounded-3xl border p-10 text-center shadow-xl">
              <div
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg"
                aria-hidden="true"
              >
                <Github className="h-7 w-7 text-white" />
              </div>
              <h2
                id="oss-heading"
                className="text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Fully open source —{" "}
                <span className="gradient-text">MIT Licensed</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Read the code, self-host it, contribute to it, or fork it. CareerForge AI is built
                in the open. No vendor lock-in, no paywalls, no data sold.
              </p>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
                {[
                  "No account required",
                  "Data stays on your device",
                  "No analytics without consent",
                  "Self-hostable",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/builder">
                  <Button
                    size="lg"
                    className="btn-glow gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                  >
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
      <footer className="border-t bg-muted/20" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-500">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">CareerForge AI</span>
              <Badge variant="outline" className="text-xs">MIT</Badge>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer navigation">
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

            {/* Rights */}
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CareerForge AI — Open source. Free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
