import { q, pct } from "@/lib/stage/css";

/**
 * CODA — the creature signs off, laying and retracting one last bar of ink.
 */
export function ContactChapter({
  chapterRef,
}: {
  chapterRef: (el: HTMLDivElement | null) => void;
}) {
  const t = q(0.18, 0.42);
  return (
    <div ref={chapterRef} className="chapter">
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24">
        <h2 className="relative overflow-hidden text-[12vw] font-bold leading-[0.9] tracking-tight md:text-[6.5vw]">
          <span
            className="block"
            style={{ clipPath: `inset(0 ${pct(`(1 - ${t})`)} 0 0)` }}
          >
            Say something
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-[12%] w-[14%] bg-foreground"
            style={{
              left: pct(`(${t} * 1.02 - 0.12)`),
              opacity: `calc(${q(0.16, 0.18)} - ${q(0.42, 0.45)})`,
            }}
          />
        </h2>
        <div
          className="mt-14 flex flex-wrap gap-x-14 gap-y-4 text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground md:text-xs"
          style={{ opacity: q(0.5, 0.66) }}
        >
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
      </div>
    </div>
  );
}
