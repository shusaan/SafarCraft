import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { parseShareId, decodeResume } from "@/engines/share/encode";
import { renderTemplate } from "@/engines/templates/registry";
import { personLd } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoded = parseShareId(id);
  if (!encoded) return { title: "Shared resume — CareerForge AI", robots: { index: false, follow: false } };
  const { data } = decodeResume(encoded);
  const title = data.personal.name ? `${data.personal.name} — Resume` : "Shared resume — CareerForge AI";
  const description = data.personal.summary?.slice(0, 160) ?? "Shared resume built with CareerForge AI";
  return {
    title,
    description,
    robots: { index: false, follow: false }, // don't index personal resumes
  };
}

export default async function SharedResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoded = parseShareId(id);
  if (!encoded) notFound();
  const { data, layout, template } = decodeResume(encoded);

  const headersList = await headers();
  const host = headersList.get("host") ?? "careerforge.app";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;
  const resumePath = `/r/${id}`;
  const resumeUrl = `${origin}${resumePath}`;

  // Person + WebSite + BreadcrumbList JSON-LD for AI crawlers and
  // structured-data tools. Includes sameAs (LinkedIn / GitHub) if present.
  const sameAs = [data.personal.linkedin, data.personal.github].filter(
    (v): v is string => Boolean(v && /^https?:\/\//.test(v)),
  );
  const jsonLd = personLd({
    name: data.personal.name || "Anonymous",
    jobTitle: data.experience?.[0]?.position || "Open to opportunities",
    email: data.personal.email,
    phone: data.personal.phone,
    address: data.personal.location,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    publicResumePath: resumePath,
  });

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd}
      />
      {/* Top banner */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
              <span className="text-[10px]">◆</span>
            </span>
            CareerForge AI
          </Link>
          <Link
            href={`${origin}/builder`}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Build your own →
          </Link>
        </div>
      </header>

      {/* Resume canvas */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {renderTemplate(template, { data, layout })}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Shared via{" "}
          <Link href="/" className="underline hover:text-zinc-700">
            CareerForge AI
          </Link>
          {" "}— free, local-first, MIT-licensed.
        </p>
        <link itemProp="url" href={resumeUrl} className="hidden" />
      </main>
    </div>
  );
}