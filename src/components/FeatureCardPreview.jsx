import Link from "next/link";

export default function FeatureCardPreview({ title, blurb, href, cta = "Open", preview }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted">{blurb}</p>
      </div>
      <div className="px-4 sm:px-5 pb-4">{preview}</div>
      <div className="mt-auto px-4 sm:px-5 pb-5">
        <Link href={href} className="text-accent hover:underline text-sm">{cta} →</Link>
      </div>
    </article>
  );
}
