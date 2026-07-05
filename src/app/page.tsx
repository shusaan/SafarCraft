import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VisitorCounter } from "@/components/analytics/visitor-counter";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">CareerForge AI</span>
            <VisitorCounter />
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/builder"><Button variant="ghost" size="sm">Builder</Button></Link>
            <Link href="/builder?panel=templates"><Button variant="ghost" size="sm">Templates</Button></Link>
            <Link href="/builder"><Button size="sm">Get Started</Button></Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
              No signup required — start building immediately
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Build ATS-Optimized Resumes with
              <span className="text-primary"> AI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Open-source resume platform for software engineers. Real-time editing, AI assistance, GitHub
              intelligence, and ATS analysis — all free.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/builder">
                <Button size="lg">Start Building</Button>
              </Link>
              <a href="https://github.com/yourusername/careerforge-ai" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">View on GitHub</Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Your data stays on your device — no account needed
            </p>
          </div>
        </section>

        <section className="border-t py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-xl border p-6">
                  <div className="mb-4 text-2xl" role="img" aria-hidden="true">{feature.icon}</div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>CareerForge AI — Open source. Free forever. MIT License.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "\u270F\uFE0F",
    title: "Smart Resume Builder",
    description: "Real-time editing, drag-and-drop sections, live preview, autosave, and version history.",
  },
  {
    icon: "\uD83D\uDD0D",
    title: "ATS Analysis",
    description: "Detailed ATS scoring with explanations for every deduction and actionable recommendations.",
  },
  {
    icon: "\uD83E\uDD16",
    title: "AI Assistant",
    description: "Improve bullets, rewrite summaries, check grammar, and generate stronger action verbs.",
  },
  {
    icon: "\uD83D\uDCCB",
    title: "GitHub Intelligence",
    description: "Import your GitHub profile and auto-generate contribution bullets and project sections.",
  },
  {
    icon: "\uD83D\uDCC4",
    title: "Multiple Exports",
    description: "Export to PDF, DOCX, JSON Resume, and Markdown — all ATS compliant.",
  },
  {
    icon: "\uD83C\uDFA8",
    title: "Professional Templates",
    description: "Classic ATS, Modern Professional, Executive — with column and picture options.",
  },
];
