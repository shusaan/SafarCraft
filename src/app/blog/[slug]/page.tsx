import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPostBySlug } from "@/data/blog-posts";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleLd } from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = articleLd({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    datePublished: post.date,
    faq: post.faq,
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd}
      />

      <Link href="/blog" className="text-xs font-medium text-muted-foreground hover:text-foreground">
        ← All posts
      </Link>

      <header className="mt-4 mb-8 border-b pb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
          <span>·</span>
          <span>{post.readingMinutes} min read</span>
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{post.description}</p>
      </header>

      <div className="prose prose-zinc max-w-none text-base leading-relaxed">
        {post.content.split("\n\n").map((block, i) => {
          if (block.startsWith("## ")) {
            return (
              <h2 key={i} className="mt-8 mb-3 text-xl font-bold tracking-tight">
                {block.replace(/^## /, "")}
              </h2>
            );
          }
          if (block.startsWith("- ")) {
            const items = block.split("\n").filter((l) => l.startsWith("- "));
            return (
              <ul key={i} className="my-4 list-disc space-y-1 pl-6">
                {items.map((it, j) => (
                  <li key={j}>{it.replace(/^- /, "")}</li>
                ))}
              </ul>
            );
          }
          if (/^\d+\./.test(block)) {
            const items = block.split("\n").filter((l) => /^\d+\./.test(l));
            return (
              <ol key={i} className="my-4 list-decimal space-y-1 pl-6">
                {items.map((it, j) => (
                  <li key={j}>{it.replace(/^\d+\.\s*/, "")}</li>
                ))}
              </ol>
            );
          }
          return (
            <p key={i} className="my-3">
              {block}
            </p>
          );
        })}
      </div>

      {post.faq && post.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold tracking-tight">FAQ</h2>
          <div className="space-y-3">
            {post.faq.map((f, i) => (
              <details key={i} className="group rounded-lg bg-muted/30 p-4">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 rounded-md border bg-primary/5 p-5 text-center">
        <p className="text-sm font-medium">Ready to build?</p>
        <Link
          href="/builder"
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Open the free builder →
        </Link>
      </div>
    </article>
  );
}