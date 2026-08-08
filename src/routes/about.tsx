import { createFileRoute } from "@tanstack/react-router";
import { ReturnBar } from "@/components/CinematicNavigation";
import { DiscoveryField } from "@/components/DiscoveryField";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Lekha Ruthwik" },
    { name: "description", content: "About software engineer and digital maker Lekha Ruthwik." },
    { property: "og:title", content: "About — Lekha Ruthwik" },
    { property: "og:description", content: "About software engineer and digital maker Lekha Ruthwik." },
    { property: "og:type", content: "profile" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AboutPage,
});

function AboutPage() {
  return <div className="min-h-screen bg-background text-foreground"><DiscoveryField mode="about" /><ReturnBar /><main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center px-6 py-24 md:px-16"><div className="mx-auto w-full max-w-6xl"><p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">About / A fuller portrait is coming</p><h1 className="mt-8 max-w-4xl text-5xl font-light leading-[1.05] md:text-8xl">Engineer by discipline.<br />Maker by instinct.</h1><p className="mt-12 max-w-xl text-sm leading-7 text-muted-foreground">This space is being shaped into a more personal account of the ideas, tools, and interests behind the work.</p></div></main></div>;
}