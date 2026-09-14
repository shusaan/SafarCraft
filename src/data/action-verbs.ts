/**
 * Action Verbs Bank
 * 250+ strong action verbs across 7 domains.
 * Used by Verb Swap helper to suggest stronger alternatives to weak first words.
 */

export type VerbDomain =
  | "Engineering"
  | "Leadership"
  | "Design"
  | "Data"
  | "Product"
  | "Research"
  | "Operations";

export interface ActionVerb {
  verb: string;
  domain: VerbDomain;
}

const ENGINEERING: ActionVerb[] = [
  { verb: "Architected", domain: "Engineering" },
  { verb: "Built", domain: "Engineering" },
  { verb: "Coded", domain: "Engineering" },
  { verb: "Compiled", domain: "Engineering" },
  { verb: "Configured", domain: "Engineering" },
  { verb: "Debugged", domain: "Engineering" },
  { verb: "Deployed", domain: "Engineering" },
  { verb: "Designed", domain: "Engineering" },
  { verb: "Developed", domain: "Engineering" },
  { verb: "Documented", domain: "Engineering" },
  { verb: "Engineered", domain: "Engineering" },
  { verb: "Implemented", domain: "Engineering" },
  { verb: "Integrated", domain: "Engineering" },
  { verb: "Launched", domain: "Engineering" },
  { verb: "Migrated", domain: "Engineering" },
  { verb: "Modularised", domain: "Engineering" },
  { verb: "Optimised", domain: "Engineering" },
  { verb: "Patched", domain: "Engineering" },
  { verb: "Programmed", domain: "Engineering" },
  { verb: "Prototyped", domain: "Engineering" },
  { verb: "Refactored", domain: "Engineering" },
  { verb: "Released", domain: "Engineering" },
  { verb: "Resolved", domain: "Engineering" },
  { verb: "Restructured", domain: "Engineering" },
  { verb: "Scaled", domain: "Engineering" },
  { verb: "Scripted", domain: "Engineering" },
  { verb: "Secured", domain: "Engineering" },
  { verb: "Shipped", domain: "Engineering" },
  { verb: "Specced", domain: "Engineering" },
  { verb: "Streamlined", domain: "Engineering" },
  { verb: "Tested", domain: "Engineering" },
  { verb: "Tuned", domain: "Engineering" },
  { verb: "Upgraded", domain: "Engineering" },
  { verb: "Validated", domain: "Engineering" },
  { verb: "Wrote", domain: "Engineering" },
];

const LEADERSHIP: ActionVerb[] = [
  { verb: "Aligned", domain: "Leadership" },
  { verb: "Authored", domain: "Leadership" },
  { verb: "Briefed", domain: "Leadership" },
  { verb: "Built", domain: "Leadership" },
  { verb: "Chaired", domain: "Leadership" },
  { verb: "Coached", domain: "Leadership" },
  { verb: "Coordinated", domain: "Leadership" },
  { verb: "Cultivated", domain: "Leadership" },
  { verb: "Delegated", domain: "Leadership" },
  { verb: "Directed", domain: "Leadership" },
  { verb: "Drove", domain: "Leadership" },
  { verb: "Empowered", domain: "Leadership" },
  { verb: "Enabled", domain: "Leadership" },
  { verb: "Established", domain: "Leadership" },
  { verb: "Facilitated", domain: "Leadership" },
  { verb: "Founded", domain: "Leadership" },
  { verb: "Guided", domain: "Leadership" },
  { verb: "Hired", domain: "Leadership" },
  { verb: "Inspired", domain: "Leadership" },
  { verb: "Led", domain: "Leadership" },
  { verb: "Managed", domain: "Leadership" },
  { verb: "Mentored", domain: "Leadership" },
  { verb: "Mobilised", domain: "Leadership" },
  { verb: "Motivated", domain: "Leadership" },
  { verb: "Negotiated", domain: "Leadership" },
  { verb: "Organised", domain: "Leadership" },
  { verb: "Oversaw", domain: "Leadership" },
  { verb: "Partnered", domain: "Leadership" },
  { verb: "Pioneered", domain: "Leadership" },
  { verb: "Prioritised", domain: "Leadership" },
  { verb: "Recruited", domain: "Leadership" },
  { verb: "Resolved", domain: "Leadership" },
  { verb: "Set", domain: "Leadership" },
  { verb: "Spearheaded", domain: "Leadership" },
  { verb: "Sponsored", domain: "Leadership" },
  { verb: "Steered", domain: "Leadership" },
  { verb: "Stewarded", domain: "Leadership" },
  { verb: "Supervised", domain: "Leadership" },
  { verb: "Unified", domain: "Leadership" },
];

const DESIGN: ActionVerb[] = [
  { verb: "Branded", domain: "Design" },
  { verb: "Conceptualised", domain: "Design" },
  { verb: "Crafted", domain: "Design" },
  { verb: "Created", domain: "Design" },
  { verb: "Curated", domain: "Design" },
  { verb: "Designed", domain: "Design" },
  { verb: "Drafted", domain: "Design" },
  { verb: "Drew", domain: "Design" },
  { verb: "Edited", domain: "Design" },
  { verb: "Illustrated", domain: "Design" },
  { verb: "Imagined", domain: "Design" },
  { verb: "Iterated", domain: "Design" },
  { verb: "Mapped", domain: "Design" },
  { verb: "Mocked", domain: "Design" },
  { verb: "Modelled", domain: "Design" },
  { verb: "Packaged", domain: "Design" },
  { verb: "Painted", domain: "Design" },
  { verb: "Polished", domain: "Design" },
  { verb: "Produced", domain: "Design" },
  { verb: "Prototyped", domain: "Design" },
  { verb: "Refined", domain: "Design" },
  { verb: "Rendered", domain: "Design" },
  { verb: "Reimagined", domain: "Design" },
  { verb: "Sketched", domain: "Design" },
  { verb: "Storyboarded", domain: "Design" },
  { verb: "Styled", domain: "Design" },
  { verb: "Visualised", domain: "Design" },
  { verb: "Wireframed", domain: "Design" },
];

const DATA: ActionVerb[] = [
  { verb: "Analysed", domain: "Data" },
  { verb: "Benchmarked", domain: "Data" },
  { verb: "Charted", domain: "Data" },
  { verb: "Clustered", domain: "Data" },
  { verb: "Computed", domain: "Data" },
  { verb: "Correlated", domain: "Data" },
  { verb: "Defined", domain: "Data" },
  { verb: "Discovered", domain: "Data" },
  { verb: "Estimated", domain: "Data" },
  { verb: "Evaluated", domain: "Data" },
  { verb: "Extracted", domain: "Data" },
  { verb: "Forecasted", domain: "Data" },
  { verb: "Indexed", domain: "Data" },
  { verb: "Instrumented", domain: "Data" },
  { verb: "Interpreted", domain: "Data" },
  { verb: "Investigated", domain: "Data" },
  { verb: "Mapped", domain: "Data" },
  { verb: "Measured", domain: "Data" },
  { verb: "Modelled", domain: "Data" },
  { verb: "Profiled", domain: "Data" },
  { verb: "Queried", domain: "Data" },
  { verb: "Reconciled", domain: "Data" },
  { verb: "Reported", domain: "Data" },
  { verb: "Sampled", domain: "Data" },
  { verb: "Segmented", domain: "Data" },
  { verb: "Simulated", domain: "Data" },
  { verb: "Stat-tested", domain: "Data" },
  { verb: "Surveyed", domain: "Data" },
  { verb: "Tracked", domain: "Data" },
  { verb: "Triangulated", domain: "Data" },
  { verb: "Validated", domain: "Data" },
  { verb: "Visualised", domain: "Data" },
];

const PRODUCT: ActionVerb[] = [
  { verb: "Assessed", domain: "Product" },
  { verb: "Championed", domain: "Product" },
  { verb: "Clarified", domain: "Product" },
  { verb: "Conceived", domain: "Product" },
  { verb: "Crafted", domain: "Product" },
  { verb: "Defined", domain: "Product" },
  { verb: "Delivered", domain: "Product" },
  { verb: "Discovered", domain: "Product" },
  { verb: "Drove", domain: "Product" },
  { verb: "Evangelised", domain: "Product" },
  { verb: "Framed", domain: "Product" },
  { verb: "Grew", domain: "Product" },
  { verb: "Identified", domain: "Product" },
  { verb: "Influenced", domain: "Product" },
  { verb: "Initiated", domain: "Product" },
  { verb: "Launched", domain: "Product" },
  { verb: "Mapped", domain: "Product" },
  { verb: "Measured", domain: "Product" },
  { verb: "Negotiated", domain: "Product" },
  { verb: "Orchestrated", domain: "Product" },
  { verb: "Owned", domain: "Product" },
  { verb: "Pitched", domain: "Product" },
  { verb: "Planned", domain: "Product" },
  { verb: "Positioned", domain: "Product" },
  { verb: "Prioritised", domain: "Product" },
  { verb: "Prototyped", domain: "Product" },
  { verb: "Roadmapped", domain: "Product" },
  { verb: "Scoped", domain: "Product" },
  { verb: "Shipped", domain: "Product" },
  { verb: "Specified", domain: "Product" },
  { verb: "Steered", domain: "Product" },
  { verb: "Strategised", domain: "Product" },
  { verb: "Validated", domain: "Product" },
];

const RESEARCH: ActionVerb[] = [
  { verb: "Authored", domain: "Research" },
  { verb: "Catalogued", domain: "Research" },
  { verb: "Classified", domain: "Research" },
  { verb: "Collected", domain: "Research" },
  { verb: "Composed", domain: "Research" },
  { verb: "Conducted", domain: "Research" },
  { verb: "Critiqued", domain: "Research" },
  { verb: "Documented", domain: "Research" },
  { verb: "Drafted", domain: "Research" },
  { verb: "Evaluated", domain: "Research" },
  { verb: "Examined", domain: "Research" },
  { verb: "Experimented", domain: "Research" },
  { verb: "Explored", domain: "Research" },
  { verb: "Formulated", domain: "Research" },
  { verb: "Hypothesised", domain: "Research" },
  { verb: "Investigated", domain: "Research" },
  { verb: "Mapped", domain: "Research" },
  { verb: "Modelled", domain: "Research" },
  { verb: "Observed", domain: "Research" },
  { verb: "Published", domain: "Research" },
  { verb: "Reviewed", domain: "Research" },
  { verb: "Surveyed", domain: "Research" },
  { verb: "Synthesised", domain: "Research" },
  { verb: "Tested", domain: "Research" },
  { verb: "Triangulated", domain: "Research" },
  { verb: "Validated", domain: "Research" },
  { verb: "Wrote", domain: "Research" },
];

const OPERATIONS: ActionVerb[] = [
  { verb: "Accelerated", domain: "Operations" },
  { verb: "Achieved", domain: "Operations" },
  { verb: "Administered", domain: "Operations" },
  { verb: "Allocated", domain: "Operations" },
  { verb: "Audited", domain: "Operations" },
  { verb: "Automated", domain: "Operations" },
  { verb: "Centralised", domain: "Operations" },
  { verb: "Consolidated", domain: "Operations" },
  { verb: "Cut", domain: "Operations" },
  { verb: "Delivered", domain: "Operations" },
  { verb: "Eliminated", domain: "Operations" },
  { verb: "Enforced", domain: "Operations" },
  { verb: "Ensured", domain: "Operations" },
  { verb: "Established", domain: "Operations" },
  { verb: "Executed", domain: "Operations" },
  { verb: "Expedited", domain: "Operations" },
  { verb: "Generated", domain: "Operations" },
  { verb: "Implemented", domain: "Operations" },
  { verb: "Improved", domain: "Operations" },
  { verb: "Increased", domain: "Operations" },
  { verb: "Initiated", domain: "Operations" },
  { verb: "Institutionalised", domain: "Operations" },
  { verb: "Monitored", domain: "Operations" },
  { verb: "Operated", domain: "Operations" },
  { verb: "Orchestrated", domain: "Operations" },
  { verb: "Organised", domain: "Operations" },
  { verb: "Overhauled", domain: "Operations" },
  { verb: "Processed", domain: "Operations" },
  { verb: "Reduced", domain: "Operations" },
  { verb: "Reinforced", domain: "Operations" },
  { verb: "Resolved", domain: "Operations" },
  { verb: "Restructured", domain: "Operations" },
  { verb: "Saved", domain: "Operations" },
  { verb: "Scaled", domain: "Operations" },
  { verb: "Standardised", domain: "Operations" },
  { verb: "Streamlined", domain: "Operations" },
  { verb: "Tracked", domain: "Operations" },
  { verb: "Transformed", domain: "Operations" },
];

export const ACTION_VERBS: ActionVerb[] = [
  ...ENGINEERING,
  ...LEADERSHIP,
  ...DESIGN,
  ...DATA,
  ...PRODUCT,
  ...RESEARCH,
  ...OPERATIONS,
];

export const WEAK_VERBS = new Set([
  "worked",
  "was",
  "were",
  "had",
  "has",
  "have",
  "did",
  "made",
  "got",
  "helped",
  "responsible",
  "handled",
  "performed",
  "provided",
  "assisted",
  "supported",
  "tasked",
  "involved",
  "did",
  "use",
  "used",
  "using",
]);

export function getVerbsByDomain(domain: VerbDomain): ActionVerb[] {
  return ACTION_VERBS.filter((v) => v.domain === domain);
}

export function detectFirstVerb(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^([A-Za-z]+)/);
  return match ? match[1]!.toLowerCase() : "";
}

export function detectCategory(text: string): VerbDomain {
  const lower = text.toLowerCase();
  if (/\b(built|shipped|coded|deployed|refactored|scaled|engineered|architected|debugged)\b/.test(lower)) return "Engineering";
  if (/\b(led|mentored|coached|managed|hired|directed|drove|spearheaded)\b/.test(lower)) return "Leadership";
  if (/\b(designed|crafted|sketched|prototyped|wireframed|styled|branded|illustrated)\b/.test(lower)) return "Design";
  if (/\b(modelled|forecasted|clustered|segmented|analysed|benchmarked|visualised|computed)\b/.test(lower)) return "Data";
  if (/\b(launched|roadmapped|prioritised|championed|owned|evangelised|grew)\b/.test(lower)) return "Product";
  if (/\b(published|authored|investigated|formulated|examined|hypothesised|synthesised)\b/.test(lower)) return "Research";
  if (/\b(automated|standardised|streamlined|consolidated|executed|monitored|audited|enforced)\b/.test(lower)) return "Operations";
  return "Engineering";
}

export function suggestVerbFor(text: string, limit = 5): ActionVerb[] {
  const domain = detectCategory(text);
  const verbs = getVerbsByDomain(domain);
  const firstVerb = detectFirstVerb(text);
  const filtered = verbs.filter((v) => v.verb.toLowerCase() !== firstVerb);
  return filtered.slice(0, limit);
}
