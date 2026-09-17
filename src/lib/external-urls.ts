// Centralised external URLs. Override via environment variables.
// NEXT_PUBLIC_REPO_URL — link to the source repo (default: GitHub)
export const REPO_URL =
  process.env.NEXT_PUBLIC_REPO_URL?.trim() || "https://github.com/anomalyco/careerforge-ai";
export const REPO_CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;