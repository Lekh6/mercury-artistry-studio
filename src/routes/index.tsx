import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/Experience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lekha Ruthwik — The White Creator" },
      {
        name: "description",
        content:
          "A scroll-driven monochrome experience where a single living white entity surfs, burns, shatters and sweeps every project into existence.",
      },
      { property: "og:title", content: "Lekha Ruthwik — The White Creator" },
      {
        property: "og:description",
        content:
          "A scroll-driven monochrome experience where a single living white entity surfs, burns, shatters and sweeps every project into existence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-background text-foreground">
      <Experience />
    </div>
  );
}
