import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ReturnBar } from "@/components/CinematicNavigation";
import { portfolioProjects } from "@/lib/portfolio";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [
    { title: "Projects — Lekha Ruthwik" },
    { name: "description", content: "Selected interaction, generative, web, and motion projects by Lekha Ruthwik." },
    { property: "og:title", content: "Projects — Lekha Ruthwik" },
    { property: "og:description", content: "Selected interaction, generative, web, and motion projects by Lekha Ruthwik." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = scope.current?.querySelectorAll<HTMLElement>(".project-row");
    if (!nodes?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-focused");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.25 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ReturnBar />
      <main ref={scope} className="projects-scroll mx-auto max-w-7xl px-6 pb-40 pt-20 md:px-12 md:pt-28">
        <header className="mb-32 grid gap-8 border-b border-border pb-12 md:grid-cols-[1fr_auto] md:items-end">
          <div><p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">Index / 01—04</p><h1 className="mt-5 text-5xl font-light md:text-7xl">Selected projects</h1></div>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">Digital products and systems shaped through interaction, structure, and motion.</p>
        </header>
        <div className="space-y-[18vh] md:space-y-[26vh]">
          {portfolioProjects.map((project, index) => (
            <article key={project.index} className={`project-row ${index % 2 ? "project-row--right md:ml-auto" : "project-row--left"}`}>
              <div className="project-window" aria-hidden>
                <div className="project-window__bar"><span /><span /><span /><code>{project.title.toLowerCase()}.tsx</code></div>
                <div className="project-window__body"><span>{project.index}</span><strong>{project.title.slice(0, 1)}</strong><span>{project.year}</span></div>
              </div>
              <div className="mt-7 grid gap-5 border-t border-border pt-5 md:grid-cols-[auto_1fr] md:gap-12">
                <p className="text-xs text-muted-foreground">{project.index} / {project.year}</p>
                <div><h2 className="text-3xl font-normal md:text-5xl">{project.title}</h2><p className="mt-3 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">{project.discipline}</p><p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">{project.note}</p></div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
