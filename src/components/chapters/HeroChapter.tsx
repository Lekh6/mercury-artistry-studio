import { q, pct } from "@/lib/stage/css";

/**
 * HERO — the creature is alone, then travels left and lays a bar of white
 * ink over the name, retracting it to leave the glyphs behind
 * (reverse text-selection).
 */
export function HeroChapter({
  chapterRef,
}: {
  chapterRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={chapterRef} className="chapter">
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-24">
        <h1 className="text-[14vw] font-bold leading-[0.86] tracking-tight md:text-[9vw]">
          <Line text="Lekha" a={0.16} b={0.34} />
          <Line text="Ruthwik" a={0.36} b={0.54} />
        </h1>
        <p
          className="mt-10 max-w-sm text-[0.62rem] uppercase tracking-[0.4em] text-muted-foreground md:text-xs"
          style={{ opacity: q(0.62, 0.78) }}
        >
          Interaction design — kept in one colour
        </p>
        <p
          className="mt-14 text-[0.6rem] uppercase tracking-[0.5em] text-muted-foreground"
          style={{ opacity: `calc(1 - ${q(0.02, 0.12)})` }}
        >
          Scroll — it is waiting
        </p>
      </div>
    </div>
  );
}

function Line({ text, a, b }: { text: string; a: number; b: number }) {
  const t = q(a, b);
  return (
    <span className="relative block overflow-hidden">
      <span
        className="block"
        style={{ clipPath: `inset(0 ${pct(`(1 - ${t})`)} 0 0)` }}
      >
        {text}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-[10%] w-[16%] bg-foreground"
        style={{
          left: pct(`(${t} * 1.02 - 0.14)`),
          opacity: `calc(${q(a - 0.02, a)} - ${q(b, b + 0.03)})`,
        }}
      />
    </span>
  );
}
