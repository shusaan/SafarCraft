import { Suspense } from "react";
import type { Metadata } from "next";
import { BuilderLayout } from "@/components/builder/builder-layout";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Free CV Builder — Edit Your CV Online",
  description:
    "Open the SafarCraft CV builder to edit your CV or resume section by section, review ATS guidance, tailor it to a job description, and export a free PDF or DOCX.",
  path: "/builder",
});

function BuilderPageInner() {
  return <BuilderLayout />;
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading builder...</div>}>
      <BuilderPageInner />
    </Suspense>
  );
}
