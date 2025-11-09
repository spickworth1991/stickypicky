import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project }) {
  const hasCover = !!project.cover;

  return (
    <article className="group card overflow-hidden p-0 hover:translate-y-[-2px] transition-transform">
      <div className="relative aspect-video">
        {hasCover ? (
          <Image
            src={project.cover}
            alt={project.title}
            fill
            sizes="(max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            priority={false}
          />
        ) : (
          // premium fallback (no network/no 404s)
          <div className="h-full w-full bg-[radial-gradient(120%_80%_at_20%_0%,rgba(25,227,255,0.18),transparent_60%),radial-gradient(80%_60%_at_100%_0%,rgba(25,227,255,0.10),transparent_60%)]" />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold">{project.title}</h3>
        <p className="text-sm text-muted mt-1 line-clamp-2">{project.tagline}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {project.stack?.map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          {project.url && (
            <a href={project.url} target="_blank" rel="noreferrer" className="link">
              Live site →
            </a>
          )}
          <Link href={`/projects#${project.slug}`} className="muted-link">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
