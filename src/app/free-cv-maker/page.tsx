import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd, faqLd } from "@/lib/seo/jsonld";

const FAQS = [
  {
    q: "Is SafarCraft really free?",
    a: "Yes. Every template, ATS check, and export — PDF, DOCX, JSON Resume, Markdown, and TXT — is free. There is no paid tier, no watermark, and no download paywall.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. You can start a CV, edit it, and export it without signing up. Your draft is saved in your browser. An account is only needed if you choose optional cloud sync.",
  },
  {
    q: "Can I make a CV without uploading it to a server?",
    a: "Yes. SafarCraft is local-first by default. Importing a PDF or DOCX and editing your CV happen in your browser. Your resume text is not sent to our servers.",
  },
  {
    q: "Does SafarCraft work for ATS systems?",
    a: "SafarCraft includes deterministic ATS guidance across content, format, ATS, brevity, and impact. It is practical guidance to review, not a guarantee of passing any specific applicant tracking system.",
  },
  {
    q: "Can I use SafarCraft for free CV templates?",
    a: "Yes. There are eight free templates, including single-column ATS-friendly layouts. Browse the CV templates page to pick one and start editing.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Free CV Maker — Build a CV Online (No Signup)",
  description:
    "Make a free CV online with SafarCraft. Eight templates, ATS guidance, PDF/DOCX/JSON export, no signup and no watermark. Your CV stays in your browser.",
  path: "/free-cv-maker",
});

export default function FreeCvMakerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={faqLd(FAQS)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Free CV maker", path: "/free-cv-maker" },
          ])}
        />

        <Section background="gradient" spacing="loose">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Free forever · No account · No watermark
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
                Free CV maker for work worth reading.
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                Build a clean, ATS-friendly CV in your browser. Start from a
                template or import your existing CV, review practical checks, and
                export a PDF or DOCX — all without signing up or paying.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/onboarding?path=scratch">
                    Start a free CV
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/onboarding?path=import">
                    <FileText className="h-4 w-4" />
                    Import my CV
                  </Link>
                </Button>
              </div>
              <ul aria-label="Trust signals" className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Free PDF &amp; DOCX export</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>No signup required</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Private by default</span>
                </li>
              </ul>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Everything you need to finish a CV today
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                No upgrades, no watermarks, and no hidden download step. The
                builder is designed to get a readable draft out of your browser
                quickly.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileText,
                  title: "Import a PDF or DOCX",
                  body: "Drop in an existing CV and turn it into an editable draft without uploading it.",
                },
                {
                  icon: Sparkles,
                  title: "Eight free templates",
                  body: "Single-column ATS layouts, modern designs, and executive options — all free.",
                },
                {
                  icon: Wand2,
                  title: "Job-description tailoring",
                  body: "Paste a job ad to see matching keywords and bring relevant bullets forward.",
                },
                {
                  icon: ShieldCheck,
                  title: "ATS guidance",
                  body: "Deterministic checks across content, format, brevity, and impact — guidance, not a guarantee.",
                },
                {
                  icon: FileText,
                  title: "Flexible exports",
                  body: "Export PDF, DOCX, JSON Resume, Markdown, or plain text whenever you are ready.",
                },
                {
                  icon: ShieldCheck,
                  title: "Local-first privacy",
                  body: "Your CV stays in your browser unless you explicitly share or sync it.",
                },
              ].map((item) => (
                <li key={item.title} className="rounded-xl border bg-card p-6">
                  <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        <Section background="muted">
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                How to make a free CV in three steps
              </h2>
            </div>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Start or import",
                  body: "Pick a template, start from scratch, or import an existing CV or resume file.",
                },
                {
                  title: "Write and review",
                  body: "Fill in your experience, then review the ATS checks and tailor bullets to the role.",
                },
                {
                  title: "Export and send",
                  body: "Download a PDF or DOCX, or export JSON Resume to keep your data portable.",
                },
              ].map((step, index) => (
                <li key={step.title} className="rounded-2xl border bg-background p-6 shadow-sm">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Free CV maker questions, answered
                </h2>
                <dl className="mt-8 space-y-6">
                  {FAQS.map((faq) => (
                    <div key={faq.q}>
                      <dt className="text-base font-semibold">{faq.q}</dt>
                      <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <aside className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-semibold">Keep exploring</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link className="text-primary hover:underline" href="/cv-templates">
                      Browse free CV templates
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/ats-cv-checker">
                      Review your CV against ATS guidance
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/alternatives">
                      Compare SafarCraft with other CV builders
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/blog/ats-friendly-resume-format-2026">
                      Read the ATS-friendly CV format guide
                    </Link>
                  </li>
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link href="/builder">
                    Open the CV builder
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </aside>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}
