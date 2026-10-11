"use client";

/**
 * Thin React hook over `trackEvent` for components that want a stable
 * callback identity. The hook itself doesn't memoize — callers don't need
 * that since `trackEvent` already no-ops outside the browser.
 */
import { useCallback } from "react";
import { trackEvent, type AnalyticsEvent } from "@/engines/analytics";

export function useAnalytics() {
  return useCallback(
    (event: AnalyticsEvent, metadata?: Record<string, string | number | boolean>) => {
      trackEvent(event, metadata);
    },
    [],
  );
}
