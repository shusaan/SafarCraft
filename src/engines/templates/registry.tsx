import { ClassicATS } from "./classic-ats";
import { ModernProfessional } from "./modern-professional";
import { Executive } from "./executive";
import { Pikachu } from "./pikachu";
import { Onyx } from "./onyx";
import { Leafish } from "./leafish";
import { Bronzor } from "./bronzor";
import { Gengar } from "./gengar";
import type { TemplateProps } from "./renderer";

export const templateRegistry = {
  "classic-ats": ClassicATS,
  "modern-professional": ModernProfessional,
  executive: Executive,
  pikachu: Pikachu,
  onyx: Onyx,
  leafish: Leafish,
  bronzor: Bronzor,
  gengar: Gengar,
} as const;

export type TemplateId = keyof typeof templateRegistry;

export function renderTemplate(template: string, props: TemplateProps) {
  const Component = templateRegistry[template as TemplateId] ?? ClassicATS;
  return <Component {...props} />;
}

export const TEMPLATE_CATEGORIES: Record<TemplateId, "free" | "pro"> = {
  "classic-ats": "free",
  "modern-professional": "free",
  executive: "free",
  pikachu: "free",
  onyx: "free",
  leafish: "free",
  bronzor: "free",
  gengar: "free",
};

export function getTemplateName(template: string): string {
  const names: Record<string, string> = {
    "classic-ats": "Classic ATS",
    "modern-professional": "Modern Professional",
    executive: "Executive",
    pikachu: "Pikachu",
    onyx: "Onyx",
    leafish: "Leafish",
    bronzor: "Bronzor",
    gengar: "Gengar",
  };
  return names[template] ?? "Classic ATS";
}

export function getTemplateDescription(template: string): string {
  const descriptions: Record<string, string> = {
    "classic-ats": "Single-column, ATS-safe, the safest bet for any job.",
    "modern-professional": "Accent border, skill chips — friendly for tech roles.",
    executive: "Bold typography for senior ICs and managers.",
    pikachu: "Bold accent block, energetic feel for product & startup roles.",
    onyx: "Dark sidebar with skills & contact, content on the right.",
    leafish: "Compact 2-column, fits on a single page even with a long history.",
    bronzor: "Sidebar with photo, soft color blocks — creative + corporate.",
    gengar: "Dark themed resume that still prints ATS-safe on white paper.",
  };
  return descriptions[template] ?? "A professionally designed resume template.";
}
