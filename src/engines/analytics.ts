"use client";

type EventName = "step_view" | "analysis_complete" | "export_click";

export function trackEvent(event: EventName, metadata?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, metadata);
  } catch {
    // Silently fail if gtag not loaded
  }
}
