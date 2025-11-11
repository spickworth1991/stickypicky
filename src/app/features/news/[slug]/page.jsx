export const runtime = 'edge';

import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { getNews } from "@/lib/newsData";
import CouponBox from "@/components/news/CouponBox";

export function generateMetadata({ params, searchParams }) {
  const preview = searchParams?.preview === "1";
  const post = getNews(params.slug, { preview });
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | News`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [{ url: post.cover, width: 1200, height: 630 }] : undefined
    }
  };
}

export default function NewsPostPage({ params, searchParams }) {
  const preview = searchParams?.preview === "1";
  const post = getNews(params.slug, { preview });
  if (!post) notFound();

  return (
    <section className="relative overflow-clip">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 pb-16 space-y-6">
        <Link href="/features/news" className="text-sm text-accent hover:underline">← Back to News</Link>

        <header className="space-y-2">
          <div className="text-xs text-muted">
            {post.category} • {new Date(post.publishedAt).toLocaleDateString()}
            {post.draft && <span className="ml-2 text-yellow-300">DRAFT</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold">{post.title}</h1>
          <p className="text-muted">{post.excerpt}</p>
          {post.cover && (
            <img src={post.cover} alt="" className="w-full rounded-xl border border-white/10" />
          )}
        </header>

        {post.coupon && (
          <CouponBox
            code={post.coupon.code}
            expiresAt={post.coupon.expiresAt}
            cta={post.coupon.cta}
            link={post.coupon.link}
          />
        )}

        <article className="prose prose-invert max-w-none">
          <Markdown>{post.content}</Markdown>
        </article>
      </div>
    </section>
  );
}
