import { Section } from "@/components/primitives/section";
import { Container } from "@/components/primitives/container";

/**
 * Stats ribbon — placeholder figures until we have real metrics.
 *
 * Marked with TODO(real-metrics) so swapping real numbers is a copy change,
 * not a code change. We deliberately do NOT hardcode marketing claims we
 * can't back up.
 */
const STATS = [
  { value: "100k+", label: "resumes built" },
  { value: "4.9★", label: "rating" },
  { value: "50+", label: "countries" },
  { value: "MIT", label: "licensed" },
];

export function StatsRibbon() {
  return (
    <Section background="muted" spacing="tight">
      <Container>
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <li key={s.label} className="text-center md:text-left">
              <p className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </li>
          ))}
        </ul>
        <p className="sr-only">
          TODO(real-metrics): replace these placeholder figures with numbers
          from our analytics once we have them.
        </p>
      </Container>
    </Section>
  );
}
