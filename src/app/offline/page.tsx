import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, WifiOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <WifiOff className="h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-bold">You're offline</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        CareerForge works offline — your edits are saved locally. The page you're looking for hasn't been cached yet.
      </p>
      <Link href="/builder" className="mt-6">
        <Button>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Go to Builder
        </Button>
      </Link>
    </div>
  );
}
