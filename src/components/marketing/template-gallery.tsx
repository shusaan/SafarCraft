import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getTemplateDescription,
  getTemplateName,
  templateRegistry,
  type TemplateId,
} from "@/engines/templates/registry";

const TEMPLATE_IDS = Object.keys(templateRegistry) as TemplateId[];

/**
 * Read-only gallery of the real template registry. Used by `/templates` and
 * `/cv-templates` so the public pages always match what the builder ships.
 */
export function TemplateGallery() {
  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATE_IDS.map((id) => (
          <li key={id} className="group rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
            <div
              aria-hidden="true"
              className="mb-4 h-28 rounded-lg border bg-gradient-to-br from-muted/40 to-muted/10 p-3"
            >
              <div className="h-2 w-16 rounded bg-primary/30" />
              <div className="mt-2 h-1.5 w-24 rounded bg-foreground/10" />
              <div className="mt-1.5 h-1.5 w-20 rounded bg-foreground/10" />
              <div className="mt-3 h-1.5 w-28 rounded bg-foreground/10" />
              <div className="mt-1.5 h-1.5 w-24 rounded bg-foreground/10" />
            </div>
            <h3 className="text-sm font-semibold">{getTemplateName(id)}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {getTemplateDescription(id)}
            </p>
            <Link
              href="/builder?panel=templates"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Use this template
              <ArrowRight className="h-3 w-3" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/onboarding?path=scratch">
            Start with a free template
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/free-cv-maker">Learn about the free CV maker</Link>
        </Button>
      </div>
    </div>
  );
}
