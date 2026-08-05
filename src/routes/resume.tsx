import { createFileRoute } from "@tanstack/react-router";
import { ReturnBar } from "@/components/CinematicNavigation";

export const Route = createFileRoute("/resume")({
  head: () => ({ meta: [
    { title: "Resume — Lekha Ruthwik" },
    { name: "description", content: "Resume and selected capabilities of software engineer Lekha Ruthwik." },
    { property: "og:title", content: "Resume — Lekha Ruthwik" },
    { property: "og:description", content: "Resume and selected capabilities of software engineer Lekha Ruthwik." },
    { property: "og:type", content: "profile" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ResumePage,
});

function ResumePage() {
  return <div className="min-h-screen bg-background text-foreground"><ReturnBar /><main className="resume-sheet">
    <header className="grid gap-8 border-b border-border pb-12 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">Curriculum vitae</p><h1 className="mt-5 text-5xl font-light md:text-7xl">Lekha Ruthwik</h1></div><p className="text-sm text-muted-foreground">Software Engineer<br />India</p></header>
    <section className="resume-section"><h2>Profile</h2><p>Software engineer creating thoughtful digital products at the intersection of interaction, systems, and visual craft.</p></section>
    <section className="resume-section"><h2>Selected work</h2><div className="resume-list"><p><span>2026</span><strong>Obsidian</strong><em>Interaction Design</em></p><p><span>2025</span><strong>Silt / Vellum</strong><em>Generative Systems · Product / Web</em></p><p><span>2024</span><strong>Mercury</strong><em>Motion Identity</em></p></div></section>
    <section className="resume-section"><h2>Capabilities</h2><p>Product engineering · Frontend systems · Interaction design · Generative interfaces · Motion direction</p></section>
    <section className="resume-section"><h2>Contact</h2><a className="story-link text-sm" href="mailto:hello@lekharuthwik.com">hello@lekharuthwik.com</a></section>
  </main></div>;
}