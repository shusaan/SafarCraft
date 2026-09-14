/**
 * Achievement Templates
 * 60+ role-aware templates. Pick top N by role.
 */

export type AchievementRole =
  | "engineering"
  | "leadership"
  | "product"
  | "design"
  | "data"
  | "research"
  | "operations";

export const ACHIEVEMENT_TEMPLATES: Record<AchievementRole, string[]> = {
  engineering: [
    "Reduced p99 latency by X% by profiling and optimising the hot path in Y",
    "Cut page load time from As to Bs by lazy-loading Z",
    "Eliminated X hours of toil per week by automating Y",
    "Improved test coverage from A% to B% across Y modules",
    "Migrated X services from monolith to microservices with zero downtime",
    "Built a CI pipeline that reduced deploy time from X min to Y min",
    "Scaled system from N to M req/s without adding infrastructure",
    "Reduced infrastructure cost by X% by right-sizing instances and adopting spot",
    "Shipped feature X used by N users / M teams",
    "Patched a critical CVE within X hours",
    "Mentored N junior engineers through code reviews and pair sessions",
    "Authored design docs that unblocked Y parallel workstreams",
    "Owned the on-call rotation, kept MTTR under X min",
    "Reduced flaky-test rate from A% to B% by introducing hermetic CI",
    "Replaced vendor X with in-house solution, saving $Y/year",
  ],
  leadership: [
    "Grew the team from X to Y engineers across Z timeframes",
    "Established a hiring loop that cut time-to-hire from X to Y weeks",
    "Mentored X engineers, with Y promotions in Z period",
    "Aligned X stakeholders on Y vision across Z teams",
    "Authored the engineering strategy for X, contributing to Y growth",
    "Reduced voluntary attrition by X% via Y initiative",
    "Drove org-wide migration from A to B over X quarters",
    "Built X from 0 to 1 (or 1 to N), reaching Y outcome",
    "Negotiated X contract saving $Y/year",
    "Coached X first-time managers through their first Y cycles",
    "Set OKRs and tracked Y metrics that hit X% of target",
    "Facilitated X offsites that produced Y outcomes",
  ],
  product: [
    "Shipped X reaching Y% of target users within Z weeks",
    "Increased activation rate from A% to B% by redesigning X flow",
    "Drove Y% growth in W metric by launching Z",
    "Owned the roadmap for X area, shipping Y features in Z quarters",
    "Cut churn by X% via Y intervention",
    "Identified Y unmet need via X user research",
    "Increased NPS from A to B by improving X",
    "Validated Z hypothesis via experiment, leading to Y decision",
    "Increased MAU by X% via Y launch",
    "Reduced time-to-value from X to Y by Z",
  ],
  design: [
    "Redesigned X flow, lifting Y conversion by Z%",
    "Shipped a design system used by N engineers and M designers",
    "Reduced design-to-dev cycle time from X to Y weeks",
    "Established a research practice, conducting X interviews / quarter",
    "Improved accessibility score from A to AA across Y surfaces",
    "Crafted a brand refresh adopted across X touchpoints",
    "Reduced design-debt by X% by retiring Y old patterns",
    "Built a Figma library of N components",
    "Prototyped and tested X variants, leading to Y outcome",
  ],
  data: [
    "Modelled X with Y% accuracy / lift over baseline",
    "Built a dashboard used by N stakeholders daily",
    "Identified Y insight that drove $X in savings / revenue",
    "Migrated X from ad-hoc to governed pipelines, cutting incidents by Y%",
    "Reduced query latency from As to Bs via Z index / partition strategy",
    "Established X data contracts adopted by Y teams",
    "Improved forecast accuracy from A% to B%",
    "Saved $X/year by detecting Z anomalies in pipeline",
  ],
  research: [
    "Published X papers / preprints on Y topic",
    "Cited X times for work on Y",
    "Co-authored Z grants totalling $X",
    "Led N studies, producing M peer-reviewed publications",
    "Established a research collaboration with X (institution/company)",
    "Built a shared research platform used by N labs",
    "Presented at X conference (Y reach)",
  ],
  operations: [
    "Reduced X operational cost by Y% via Z initiative",
    "Standardised X process across Y teams",
    "Automated X manual workflow, saving Y hours/week",
    "Improved SLA from A% to B% on Y service",
    "Eliminated X compliance finding via Y remediation",
    "Onboarded N new hires within M days via Z playbook",
    "Negotiated X vendor contracts saving $Y/year",
    "Established X dashboard used by N stakeholders daily",
    "Improved X audit score from A to B",
    "Cut incident MTTR from X to Y min via Z runbook",
  ],
};

export function pickTopAchievements(role: AchievementRole, n = 3): string[] {
  const pool = ACHIEVEMENT_TEMPLATES[role] ?? ACHIEVEMENT_TEMPLATES.engineering;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
