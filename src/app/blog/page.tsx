import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog — CareerForge AI",
  description:
    "ATS-friendly resume advice, the JSON Resume standard, software engineer resume templates, and the engineering behind CareerForge AI.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "CareerForge AI Blog",
    description:
      "ATS-friendly resume advice, the JSON Resume standard, software engineer resume templates, and the engineering behind CareerForge AI.",
    type: "website",
    url: "/blog",
  },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">CareerForge AI · Blog</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Resume advice for engineers</h1>
        <p className="mt-3 text-muted-foreground">
          ATS-tested guides, free tools, and the engineering behind CareerForge AI. Updated weekly.
        </p>
      </header>

      <ul className="space-y-6">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-lg border p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </time>
                <span>·</span>
                <span>{post.readingMinutes} min read</span>
                {post.tags.slice(0, 2).map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-12 rounded-md border bg-muted/30 p-4 text-center text-sm">
        Want to build the resume these guides are about?{" "}
        <Link href="/builder" className="font-medium text-primary underline">
          Open the builder →
        </Link>
      </p>
    </div>
  );
}