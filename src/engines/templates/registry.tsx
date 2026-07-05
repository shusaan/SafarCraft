import { ClassicATS } from "./classic-ats";
import { ModernProfessional } from "./modern-professional";
import { Executive } from "./executive";
import type { TemplateProps } from "./renderer";

export const templateRegistry = {
  "classic-ats": ClassicATS,
  "modern-professional": ModernProfessional,
  executive: Executive,
} as const;

export type TemplateId = keyof typeof templateRegistry;

export function renderTemplate(template: string, props: TemplateProps) {
  const Component = templateRegistry[template as TemplateId] ?? ClassicATS;
  return <Component {...props} />;
}

export function getTemplateName(template: string): string {
  const names: Record<string, string> = {
    "classic-ats": "Classic ATS",
    "modern-professional": "Modern Professional",
    executive: "Executive",
  };
  return names[template] ?? "Classic ATS";
}
