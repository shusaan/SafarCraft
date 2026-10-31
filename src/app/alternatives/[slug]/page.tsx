import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { Button } from "@/components/ui/button";
import { ALTERNATIVES, getAlternative } from "@/data/alternatives";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd, faqLd } from "@/lib/seo/jsonld";

export function generateStaticParams() {
  return ALTERNATIVES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const alternative = getAlternative(slug);
  if (!alternative) return { title: "Not found", robots: { index: false, follow: false } };

  return buildMetadata({
    title: `${alternative.name} Alternative — Free CV Builder`,
    description: `Looking for a ${alternative.name} alternative? Compare pricing and features with SafarCraft, a free CV builder with no signup and free PDF/DOCX exports.`,
    path: `/alternatives/${alternative.slug}`,
  });
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const alternative = getAlternative(slug);
  if (!alternative) notFound();

  const faqs = [
    {
      q: `Is SafarCraft a free alternative to ${alternative.name}?`,
      a: `Yes. SafarCraft is free to use, including PDF and DOCX exports. ${alternative.name} may require a paid plan for downloads. Check ${alternative.name}'s pricing page for current details.`,
    },
    {
      q: `Can I import my existing ${alternative.name} CV?`,
      a: "If you can export your CV as a PDF or DOCX, you can import it into SafarCraft and continue editing. JSON Resume files also work.",
    },
    {
      q: "Which tool is better for ATS?",
      a: "Both tools offer ATS-oriented features. SafarCraft includes a deterministic, local review across content, format, ATS compatibility, brevity, and impact. It is guidance, not a guarantee.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={faqLd(faqs)} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Alternatives", path: "/alternatives" },
            { name: `${alternative.name} alternative`, path: `/alternatives/${alternative.slug}` },
          ])}
        />

        <Section background="gradient" spacing="loose">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-primary">
                Free alternative · No signup
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                A free {alternative.name} alternative for CVs and resumes.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {alternative.description} If free exports, local-first editing, or
                an open-source option matter to you, SafarCraft is worth a look.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/free-cv-maker">
                    Try SafarCraft free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={alternative.website} target="_blank" rel="noopener noreferrer">
                    Visit {alternative.name}
                  </a>
                </Button>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-semibold">{alternative.name} at a glance</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {alternative.tagline}
                </p>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="font-semibold">Best for</dt>
                    <dd className="mt-1 text-muted-foreground">{alternative.bestFor}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Free tier</dt>
                    <dd className="mt-1 text-muted-foreground">{alternative.freeTier}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Pricing</dt>
                    <dd className="mt-1 text-muted-foreground">{alternative.pricingNote}</dd>
                  </div>
                </dl>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {alternative.highlights.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-semibold">Where SafarCraft fits</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  SafarCraft is a focused, free CV builder. It will not replace every
                  design tool, but it covers the common path from draft to export.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {alternative.safarCraftWins.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="muted">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  {alternative.name} alternative questions
                </h2>
                <dl className="mt-8 space-y-5">
                  {faqs.map((faq) => (
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
                <h2 className="text-lg font-semibold">More comparisons</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {ALTERNATIVES.filter((item) => item.slug !== alternative.slug).map((item) => (
                    <li key={item.slug}>
                      <Link
                        className="text-primary hover:underline"
                        href={`/alternatives/${item.slug}`}
                      >
                        {item.name} alternative
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link className="text-primary hover:underline" href="/free-cv-maker">
                      Free CV maker
                    </Link>
                  </li>
                  <li>
                    <Link className="text-primary hover:underline" href="/templates">
                      Free CV templates
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
