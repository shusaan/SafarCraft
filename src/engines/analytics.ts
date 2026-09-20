"use client";

export type AnalyticsEvent =
  // Builder / dashboard
  | "step_view"
  | "analysis_complete"
  | "export_click"
  // Marketing site
  | "marketing_cta_click"
  | "marketing_section_view"
  // Onboarding
  | "onboarding_path_chosen"
  | "onboarding_import_started"
  | "onboarding_import_succeeded"
  | "onboarding_import_failed"
  // Scratch wizard
  | "wizard_step_viewed"
  | "wizard_step_completed"
  | "wizard_step_skipped"
  | "wizard_finished"
  | "wizard_abandoned"
  // Welcome state
  | "welcome_sheet_seen"
  | "welcome_sheet_dismissed";

// Back-compat alias (older call sites still pass typed string literals).
export type EventName = AnalyticsEvent;

export function trackEvent(event: AnalyticsEvent, metadata?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, metadata);
  } catch {
    // Silently fail if gtag not loaded
  }
}
