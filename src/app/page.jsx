import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  
  const SERVICE_CARDS = [
    {
      title: "Starter Site",
      price: "Custom pricing depending on scope",
      points: ["1–3 pages", "Fast + SEO basics", "Launched in a week"],
      turnaround: "~1 week", // customize per card
      // turnaroundLabel: "Typical timeline", // optional label override
    },
    {
      title: "Business Site",
      price: "Custom pricing depending on scope",
      points: ["Up to 10 pages", "Blog + CMS", "Lead forms + analytics"],
      turnaround: "1–2 weeks",
    },
    {
      title: "Custom App/Tool",
      price: "Custom pricing depending on scope",
      points: ["Next.js/React", "APIs + DB", "Performance + DX"],
      turnaround: "2–4 weeks",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-clip">
        {/* subtle cyan glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-glow" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
              Premium <span className="text-accent">websites</span> &{" "}
              <span className="text-accent">tools</span> that feel fast and look elite.
            </h1>

            <p className="mt-5 text-muted max-w-prose">
              I ship clean, performant Next.js apps, small-business sites, and custom dashboards
              with SEO that actually moves the needle.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#contact" className="btn-primary">
                Book a free consult
              </Link>
              <Link href="/projects" className="btn-ghost">
                See projects
              </Link>
              <Link href="/features" className="btn-ghost">Features</Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
              <li className="chip">Next.js</li>
              <li className="chip">Tailwind</li>
              <li className="chip">SEO</li>
              <li className="chip">APIs & DB</li>
              <li className="chip">Edge-friendly</li>
            </ul>
          </div>

          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-card">
            {/* emerald gradient backdrop (shows while image loads) */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(69,255,180,0.18),transparent_60%),radial-gradient(80%_60%_at_100%_0%,rgba(45,255,150,0.10),transparent_60%)]" />
            <Image
              src="/hero-shot.jpg"
              alt="Portfolio workspace preview"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover relative z-10"
            />
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-8">
        <h2 className="section-title">Featured work</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
        <div className="mt-6">
          <Link href="/projects" className="link">
            Browse all projects →
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <h2 className="section-title">Services</h2>

        {/* equal-height grid + comfy padding */}
        <div className="grid md:grid-cols-3 gap-6 auto-rows-[1fr]">
          {SERVICE_CARDS.map((card) => (
            <div
              key={card.title}
              className="card p-7 md:p-8 flex flex-col h-full min-h-[260px]"
            >
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 font-medium text-[color:var(--color-accent)]">
                {card.price}
              </p>

              {/* grow so footer spacing stays consistent */}
              <ul className="mt-4 space-y-2 text-muted list-disc pl-5 text-[0.95rem] leading-relaxed grow">
                {card.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>

              {/* Footer meta line (customizable per card) */}
              {card.turnaround && (
                <div className="mt-6 text-xs text-muted/80">
                  {card.turnaroundLabel ?? "Typical turnaround"}: {card.turnaround}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-2xl px-4 sm:px-6 mt-24 mb-32">
        <h2 className="section-title">Let’s talk</h2>
        <p className="text-muted mb-6">
          Prefer email?{" "}
          <a href="mailto:contact.stickypicky@gmail.com" className="link">
            contact.stickypicky@gmail.com
          </a>
        </p>

        <ContactForm />
      </section>
    </>
  );
}
