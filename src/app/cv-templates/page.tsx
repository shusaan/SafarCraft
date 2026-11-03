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
    q: "What is the difference between a CV and a resume?",
    a: "In the US, a resume is usually a one-to-two page summary tailored to a role, while a CV is a longer academic record. In the UK, EU, and much of Asia, CV and resume are used interchangeably. SafarCraft works for both styles.",
  },
  {
    q: "Are these CV templates ATS-friendly?",
    a: "The Classic ATS template is built for parser-safe output. Other templates are still clean and readable, but if you are applying through a large applicant tracking system, start with the single-column layout.",
  },
  {
    q: "Can I download a CV template for free?",
    a: "Yes. Choose a template, fill in your details, and export a free PDF or DOCX. No account or payment is required.",
  },
  {
    q: "Can I edit the CV template after downloading it?",
    a: "JSON Resume and DOCX exports give you editable data. The easiest workflow is to keep editing in SafarCraft and re-export whenever you need a fresh PDF.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Free CV Templates — Download or Edit Online",
  description:
    "Free CV templates for 2026, including ATS-friendly single-column layouts. Edit online, switch templates anytime, and download a PDF or DOCX without an account.",
  path: "/cv-templates",
});

export default function CvTemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={faqLd(FAQS)} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "CV templates", path: "/cv-templates" },
          ])}
        />

        <Section background="gradient" spacing="loose">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-primary">
                Free · No signup · ATS guidance included
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                Free CV templates you can edit online.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Start with a free CV template, fill it in with the online editor,
                and export a PDF or DOCX. Eight layouts, from strict ATS-safe to
                modern professional, with no watermark and no paywall.
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
                  What makes a good CV template?
                </h2>
                <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    A good CV template makes your experience easy to scan. Clear
                    section headings, consistent dates, and a readable font matter
                    more than decoration. Recruiters often spend under a minute on a
                    first pass, so structure does most of the work.
                  </p>
                  <p>
                    For online applications, choose a single-column template with
                    plain text. Avoid tables, text boxes, and icons in the main
                    content — those are the elements that most often break parsing.
                  </p>
                  <p>
                    For a direct application, a subtle accent or a two-column layout
                    can help you stand out, as long as the content stays readable
                    when printed in black and white.
                  </p>
                </div>
              </div>
              <aside className="rounded-2xl border bg-muted/30 p-6">
                <h2 className="text-lg font-semibold">Start here</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <Link className="text-primary hover:underline" href="/templates">
                      Browse all templates
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/free-cv-maker">
                      Make a free CV online
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/ats-cv-checker">
                      Check your CV for ATS issues
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/blog/ats-friendly-resume-format-2026">
                      ATS-friendly format guide
                    </Link>
                  </li>
                </ul>
              </aside>
            </div>
          </Container>
        </Section>

        <Section background="muted">
          <Container size="narrow">
            <h2 className="text-2xl font-semibold tracking-tight">CV template questions</h2>
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
