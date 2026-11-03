import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Start a Free CV — Import or Build from Scratch",
  description:
    "Import an existing CV or resume, or start from scratch with a guided five-step builder. Everything stays in your browser and no account is required.",
  path: "/onboarding",
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
