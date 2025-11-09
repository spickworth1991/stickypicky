import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-24">
      <h1 className="text-3xl font-semibold mb-6">Projects</h1>
      <p className="text-muted mb-8">A few builds I’m proud of.</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((p) => <ProjectCard key={p.slug} project={p} />)}
      </div>
    </section>
  );
}
