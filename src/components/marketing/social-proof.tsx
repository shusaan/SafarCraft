import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";
import { SectionHeader } from "./section-header";

/**
 * Placeholder social-proof strip — honest empty state.
 *
 * We don't have real customer logos yet; rather than fabricate brand names,
 * we ship honest placeholder boxes that the marketing owner can swap to
 * real logos via copy-only changes. See PLAN.md `TODO(real-logos)`.
 */
export function SocialProof() {
  return (
    <Section background="default">
      <Container>
        <SectionHeader
          eyebrow="Trusted by engineers"
          title="Built for the way engineers actually work."
          description="No real customer logos yet — these placeholders are honest. Once we have them, this block becomes a logo strip."
          align="center"
        />

        <ul
          aria-label="Customer logo placeholders (TODO: replace with real logos)"
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="flex h-16 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground/60"
            >
              logo {i + 1}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-xs text-muted-foreground/60">
          {/* TODO(real-logos) — replace placeholder boxes with real partner logos. */}
        </p>
      </Container>
    </Section>
  );
}
