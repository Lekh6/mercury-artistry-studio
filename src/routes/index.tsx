import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BlobEntity } from "@/components/BlobEntity";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/lib/reveals/registry";
import { setIdleTarget } from "@/lib/entity/blob";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lekha Ruthwik — Monochrome Interactive Portfolio" },
      {
        name: "description",
        content:
          "A black-and-white interactive portfolio where a single living white entity paints the interface into existence, one reveal at a time.",
      },
      { property: "og:title", content: "Lekha Ruthwik — Monochrome Interactive Portfolio" },
      {
        property: "og:description",
        content:
          "A living white entity constructs an all-monochrome portfolio in front of you: selection wipes, drag reveals, cinematic scroll.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const projects = [
  {
    index: "01",
    title: "Obsidian",
    discipline: "Interaction Design",
    year: "2026",
    note: "A spatial editor built around a single gesture. Everything else disappears.",
  },
  {
    index: "02",
    title: "Silt",
    discipline: "Generative Systems",
    year: "2025",
    note: "Simulation of sediment as a typographic medium. Rendered entirely in one channel.",
  },
  {
    index: "03",
    title: "Vellum",
    discipline: "Product / Web",
    year: "2025",
    note: "Reading software for archives. Paper physics, no chrome, no colour.",
  },
  {
    index: "04",
    title: "Mercury",
    discipline: "Motion Identity",
    year: "2024",
    note: "An identity that only exists while it is moving. Stillness erases it.",
  },
];

function Index() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 24) setScrolled(true);
      setIdleTarget({
        x: 96,
        y: window.innerHeight * 0.48,
        size: 20,
        urgency: 0.3,
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SmoothScroll />
      <BlobEntity />

      <main>
        {/* Hero — empty until the entity acts */}
        <section className="flex min-h-screen flex-col justify-center px-8 md:px-24">
          <div className="min-h-[38vh]">
            {scrolled && (
              <h1 className="text-[13vw] font-bold leading-[0.86] tracking-tight md:text-[9vw]">
                <span className="block">
                  <Reveal as="wipe" id="hero-1" delay={280} restSide="left">
                    Lekha
                  </Reveal>
                </span>
                <span className="block">
                  <Reveal as="wipe" id="hero-2" delay={900} restSide="right">
                    Ruthwik
                  </Reveal>
                </span>
              </h1>
            )}
          </div>
        </section>

        {/* Projects */}
        <section className="px-8 pb-[24vh] md:px-24">
          {projects.map((p, i) => {
            const right = i % 2 === 1;
            return (
              <article
                key={p.index}
                className={`flex py-[14vh] ${right ? "justify-end" : "justify-start"}`}
              >
                <Reveal
                  as="drag-select"
                  id={`project-${p.index}`}
                  restSide={right ? "right" : "left"}
                  className="w-full max-w-[46rem]"
                >
                  <div className={right ? "text-right" : "text-left"}>
                    <div className="flex items-baseline gap-6 text-xs uppercase tracking-[0.4em] text-muted-foreground">
                      <span>{p.index}</span>
                      <span>{p.discipline}</span>
                      <span>{p.year}</span>
                    </div>
                    <h2 className="mt-8 text-[15vw] font-bold leading-[0.84] tracking-tight md:text-[7.5vw]">
                      {p.title}
                    </h2>
                    <div className="mt-10 h-px w-full bg-foreground/20" />
                    <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                      {p.note}
                    </p>
                  </div>
                </Reveal>
              </article>
            );
          })}
        </section>

        {/* Contact */}
        <section className="flex min-h-[70vh] flex-col justify-center px-8 pb-[18vh] md:px-24">
          <Reveal as="wipe" id="contact" restSide="left">
            <h2 className="text-[11vw] font-bold leading-[0.9] tracking-tight md:text-[6vw]">
              Say something
            </h2>
          </Reveal>
          <div className="mt-16 flex flex-wrap gap-x-16 gap-y-4 text-sm uppercase tracking-[0.35em] text-muted-foreground">
            <a href="mailto:hello@lekharuthwik.com" className="hover:text-foreground">
              Email
            </a>
            <a href="#" className="hover:text-foreground">
              Instagram
            </a>
            <a href="#" className="hover:text-foreground">
              Are.na
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
