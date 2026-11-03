import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { Button } from "@/components/ui/button";
import { ALTERNATIVES } from "@/data/alternatives";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = buildMetadata({
  title: "Free CV Builder Alternatives — Compare Options",
  description:
    "Compare free and paid CV builders. See how SafarCraft's free exports, local-first editing, and open-source approach compare with Zety, Novoresume, Canva, and Resume.io.",
  path: "/alternatives",
});

export default function AlternativesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Alternatives", path: "/alternatives" },
          ])}
        />

        <Section background="gradient" spacing="loose">
          <Container>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-primary">Compare before you pay</p>
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                Free CV builder alternatives, compared honestly.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Zety, Novoresume, Canva, and Resume.io are all capable tools with
                different strengths. Here is a neutral overview, plus where
                SafarCraft fits if free exports and local-first editing matter to
                you.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {ALTERNATIVES.map((item) => (
                <li key={item.slug} className="rounded-xl border bg-card p-6">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.tagline}
                  </p>
                  <Link
                    href={`/alternatives/${item.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Read the comparison
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/free-cv-maker">
                  Try SafarCraft free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cv-templates">Browse free CV templates</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}
