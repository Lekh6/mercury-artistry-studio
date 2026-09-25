import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCinematicNavigation, type World } from "@/components/CinematicNavigation";
import { NameReveal } from "@/components/NameReveal";
import { DimensionalShear } from "@/components/DimensionalShear";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lekha Ruthwik — Software Engineer" },
      {
        name: "description",
        content:
          "Explore the projects, resume, and profile of software engineer Lekha Ruthwik.",
      },
      { property: "og:title", content: "Lekha Ruthwik — Software Engineer" },
      {
        property: "og:description",
        content:
          "Explore the projects, resume, and profile of software engineer Lekha Ruthwik.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { travel } = useCinematicNavigation();
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const seen = window.sessionStorage.getItem("lekha-intro-complete") === "true";
    setInstant(seen);
    if (!seen) window.sessionStorage.setItem("lekha-intro-complete", "true");
  }, []);

  const destinations: Array<{ world: World; label: string; className: string }> = [
    { world: "projects", label: "Projects", className: "hub-link--projects" },
    { world: "resume", label: "Resume", className: "hub-link--resume" },
    { world: "about", label: "About Me", className: "hub-link--about" },
  ];

  return (
    <main className={`landing-hub ${instant ? "is-instant" : ""}`}>
      <DimensionalShear />
      <div className="landing-mark">
        <NameReveal instant={instant} />
      </div>
      <nav className="hub-navigation" aria-label="Portfolio sections">
        {destinations.map((destination) => (
          <button
            key={destination.world}
            type="button"
            className={`hub-link ${destination.className}`}
            onClick={(event) => {
              // The hover disc itself becomes the mouth of the transition.
              const disc = event.currentTarget.querySelector(".hub-link__disc");
              const rect = (disc ?? event.currentTarget).getBoundingClientRect();
              travel(destination.world, {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                r: Math.max(rect.width, rect.height) / 2,
              });
            }}
          >
            <span className="hub-link__disc" aria-hidden />
            <span className="hub-link__label">{destination.label}</span>
            <i aria-hidden />
          </button>
        ))}
      </nav>
    </main>
  );
}
