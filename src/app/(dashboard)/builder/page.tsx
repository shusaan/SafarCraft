import { Suspense } from "react";
import { BuilderLayout } from "@/components/builder/builder-layout";

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
