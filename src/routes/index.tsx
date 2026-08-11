import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useCinematicNavigation, type World } from "@/components/CinematicNavigation";
import { NameReveal } from "@/components/NameReveal";

/** Diameter of the single shared hover disc, in px (matches .hub-disc in CSS). */
const DISC = 176;

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
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  /** One disc, shared by every option. It slides between them and never
   *  duplicates, so it can never leave fragments behind. */
  const [disc, setDisc] = useState({ x: 0, y: 0, on: false });

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

  const centerOf = (index: number) => {
    const button = buttonRefs.current[index];
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const focusDisc = (index: number) => {
    const center = centerOf(index);
    if (center) setDisc({ ...center, on: true });
  };

  const releaseDisc = () => setDisc((current) => ({ ...current, on: false }));

  return (
    <main className={`landing-hub ${instant ? "is-instant" : ""}`}>
      <div className="landing-mark">
        <NameReveal instant={instant} />
      </div>
      <nav
        className="hub-navigation"
        aria-label="Portfolio sections"
        onMouseLeave={releaseDisc}
      >
        <span
          className="hub-disc"
          aria-hidden
          data-on={disc.on}
          style={{
            transform: `translate3d(${disc.x}px, ${disc.y}px, 0) translate(-50%, -50%) scale(${disc.on ? 1 : 0.3})`,
          }}
        />
        {destinations.map((destination, index) => (
          <button
            key={destination.world}
            ref={(node) => { buttonRefs.current[index] = node; }}
            type="button"
            className={`hub-link ${destination.className}`}
            onMouseEnter={() => focusDisc(index)}
            onFocus={() => focusDisc(index)}
            onBlur={releaseDisc}
            onClick={() => {
              // The very same disc becomes the mouth of the transition.
              const center = centerOf(index);
              if (center) travel(destination.world, { ...center, r: DISC / 2 });
              else travel(destination.world);
            }}
          >
            <span className="hub-link__label">{destination.label}</span>
            <i aria-hidden />
          </button>
        ))}
      </nav>
    </main>
  );
}
