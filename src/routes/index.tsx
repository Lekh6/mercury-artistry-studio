import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCinematicNavigation, type World } from "@/components/CinematicNavigation";

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
  const destinations: Array<{ world: World; label: string; className: string }> = [
    { world: "projects", label: "Projects", className: "hub-link--projects" },
    { world: "resume", label: "Resume", className: "hub-link--resume" },
    { world: "about", label: "About Me", className: "hub-link--about" },
  ];

  return (
    <main className="landing-hub">
      <div className="landing-frame" aria-hidden />
      <header className="liquid-wordmark" aria-label="Lekha Ruthwik">
        <span className="liquid-source" aria-hidden />
        <h1><span className="wordmark-shadow">Lekha Ruthwik</span><span className="wordmark-fill" aria-hidden>Lekha Ruthwik</span></h1>
        <span className="wordmark-droplet wordmark-droplet--one" aria-hidden />
        <span className="wordmark-droplet wordmark-droplet--two" aria-hidden />
      </header>
      <nav className="hub-navigation" aria-label="Portfolio sections">
        {destinations.map((destination) => (
          <Button
            key={destination.world}
            type="button"
            variant="ghost"
            className={`hub-link ${destination.className}`}
            onClick={() => travel(destination.world)}
          >
            <span>{destination.label}</span><i aria-hidden />
          </Button>
        ))}
      </nav>
      <p className="landing-signature">Software engineer · selected work 2024—2026</p>
    </main>
  );
}
