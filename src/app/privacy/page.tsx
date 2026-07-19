import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CareerForge AI privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Data Collection</h2>
          <p className="mt-2">
            CareerForge AI uses Google Analytics to collect anonymized IP addresses only. We do not collect,
            store, or share any of your resume text, personal data, or uploaded files on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Google Analytics</h2>
          <p className="mt-2">
            We use Google Analytics with IP anonymization enabled (<code>anonymize_ip: true</code>). This means
            your IP address is truncated before being sent to Google servers. No personally identifiable
            information is collected through analytics.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Local Storage</h2>
          <p className="mt-2">
            Your resume data is stored exclusively in your browser&apos;s local storage. We do not transmit,
            store, or process your resume text or personal data on any server. You can clear this data at any
            time through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">AI Processing</h2>
          <p className="mt-2">
            If you choose to use AI features, the text you submit is sent directly to OpenAI&apos;s API for
            processing. No data is retained by CareerForge AI servers. You should not submit sensitive or
            confidential information to AI features.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Third-Party Services</h2>
          <p className="mt-2">
            We do not sell, trade, or transfer your information to third parties. The only third-party
            services used are Google Analytics (for anonymized usage statistics) and OpenAI (for AI
            features, if enabled).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, please open an issue on our GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
