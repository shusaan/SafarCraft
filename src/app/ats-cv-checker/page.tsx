import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Target } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd, faqLd } from "@/lib/seo/jsonld";

const FAQS = [
  {
    q: "Is the ATS CV checker free?",
    a: "Yes. The ATS guidance runs locally in your browser and is free, with no account and no upload required.",
  },
  {
    q: "Does a high score guarantee an interview?",
    a: "No. ATS guidance is practical advice to review, not a hiring guarantee. Recruiters still read CVs, and different systems parse files differently.",
  },
  {
    q: "What does the checker look at?",
    a: "SafarCraft reviews five axes: content, format, ATS compatibility, brevity, and impact. Each deduction includes a short explanation so you can decide what to change.",
  },
  {
    q: "Does SafarCraft upload my CV to check it?",
    a: "No. The checks run in your browser using local code. Your CV text is not sent to a server unless you explicitly publish a share link.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Free ATS CV Checker — Review Your CV Locally",
  description:
    "Check your CV against practical ATS guidance for free. Review content, format, keywords, brevity, and impact in your browser — no upload and no account.",
  path: "/ats-cv-checker",
});

export default function AtsCvCheckerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={faqLd(FAQS)} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "ATS CV checker", path: "/ats-cv-checker" },
          ])}
        />

        <Section background="gradient" spacing="loose">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-primary">
                Runs in your browser · Free · No upload
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                A free ATS CV checker that explains every deduction.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Open your CV in the SafarCraft builder and review practical ATS
                guidance across content, format, keywords, brevity, and impact. No
                upload, no account, and no vague score without an explanation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/builder">
                    Check my CV
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/free-cv-maker">Make a free CV first</Link>
                </Button>
              </div>
              <ul aria-label="Trust signals" className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Local checks</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Five review axes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Per-deduction explanations</span>
                </li>
              </ul>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                What the ATS review covers
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                The goal is not a magic score. It is a short, specific list of
                changes you can make before you apply.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  icon: Search,
                  title: "Content",
                  body: "Checks for the sections recruiters expect and flags missing details.",
                },
                {
                  icon: ShieldCheck,
                  title: "Format",
                  body: "Looks at structure, dates, and parser-unfriendly elements.",
                },
                {
                  icon: Target,
                  title: "ATS",
                  body: "Reviews headings, keywords, and file-level compatibility.",
                },
                {
                  icon: CheckCircle2,
                  title: "Brevity",
                  body: "Flags long bullets and dense paragraphs that are hard to scan.",
                },
                {
                  icon: Target,
                  title: "Impact",
                  body: "Suggests stronger verbs and measurable outcomes where possible.",
                },
              ].map((item) => (
                <li key={item.title} className="rounded-xl border bg-card p-5">
                  <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>

        <Section background="muted">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  ATS CV checker questions
                </h2>
                <dl className="mt-8 space-y-5">
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
              <aside className="rounded-2xl border bg-background p-6">
                <h2 className="text-lg font-semibold">Related pages</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link className="text-primary hover:underline" href="/free-cv-maker">
                      Free CV maker
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/cv-templates">
                      Free CV templates
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/blog/ats-friendly-resume-format-2026">
                      ATS-friendly CV format guide
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/alternatives">
                      Compare CV builders
                    </Link>
                  </li>
                </ul>
              </aside>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}
