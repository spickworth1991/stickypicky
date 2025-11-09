import Link from "next/link";

export default function FeatureCard({ title, blurb, cta, href, external }) {
  const Wrapper = external ? "a" : Link;
  const props = external ? { href, target: "_blank", rel: "noreferrer" } : { href };

  return (
    <Wrapper
      {...props}
      className="block rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 transition p-5"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted mt-2">{blurb}</p>
      <span className="inline-block mt-4 text-accent underline underline-offset-4">
        {cta}
      </span>
    </Wrapper>
  );
}
