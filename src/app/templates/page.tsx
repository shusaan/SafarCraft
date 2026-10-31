import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd, faqLd } from "@/lib/seo/jsonld";

const FAQS = [
  {
    q: "Are these CV templates free?",
    a: "Yes. All eight templates are free, including the ATS-friendly Classic ATS layout. There is no paid template tier and no watermark.",
  },
  {
    q: "Which template is safest for ATS?",
    a: "Classic ATS is the safest starting point: single column, plain headings, and no decorative icons. Modern Professional is a good middle ground for tech roles.",
  },
  {
    q: "Can I change templates after writing my CV?",
    a: "Yes. Your content is stored separately from the template, so you can switch layouts at any time without retyping your experience.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Free CV & Resume Templates (ATS-Friendly)",
  description:
    "Browse eight free CV and resume templates, including single-column ATS-friendly layouts. Switch templates anytime and export to PDF, DOCX, or JSON Resume.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={faqLd(FAQS)} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Templates", path: "/templates" },
          ])}
        />

        <Section background="gradient" spacing="loose">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-primary">8 free templates</p>
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                Free CV and resume templates that stay readable.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Pick a layout, add your experience, and export. Every template is
                free, works with the built-in ATS checks, and can be swapped at any
                time without losing your content.
              </p>
            </div>
            <div className="mt-10">
              <TemplateGallery />
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  How to choose a CV template
                </h2>
                <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Start with the role and the application system. Large employers
                    often use parsers, so a single-column layout with plain headings
                    is the safest choice. Design-forward templates are better for
                    portfolios, agencies, and direct applications where a human
                    reads the file first.
                  </p>
                  <p>
                    Keep one page unless you have more than ten years of relevant
                    experience. Prioritise your most recent role, use consistent
                    date formats, and keep bullets short enough to scan.
                  </p>
                  <p>
                    You can preview the result against the built-in ATS guidance
                    before exporting, and switch templates without starting over.
                  </p>
                </div>
              </div>
              <aside className="rounded-2xl border bg-muted/30 p-6">
                <h2 className="text-lg font-semibold">Related pages</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link className="text-primary hover:underline" href="/cv-templates">
                      CV templates guide
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/free-cv-maker">
                      Free CV maker
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/ats-cv-checker">
                      ATS CV checker
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/blog/software-engineer-resume-template">
                      Software engineer resume template guide
                    </Link>
                  </li>
                </ul>
              </aside>
            </div>
          </Container>
        </Section>

        <Section background="muted">
          <Container size="narrow">
            <h2 className="text-2xl font-semibold tracking-tight">Template questions</h2>
            <dl className="mt-6 space-y-5">
              {FAQS.map((faq) => (
                <div key={faq.q}>
                  <dt className="text-base font-semibold">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}
