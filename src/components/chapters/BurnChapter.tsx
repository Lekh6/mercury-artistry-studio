import { q, qe, pct } from "@/lib/stage/css";
import { ProjectPlaque, type ChapterProps } from "./shared";

/**
 * PROJECT 02 — FLASH PAPER.
 * A fresh blank plate slides in from the right, the creature strikes a
 * lighter at the lower-left corner and the whole plate flashes away almost
 * at once. EXIT: the remains are pushed into a trapdoor that opens, swallows
 * them and closes; the outline fades.
 */
export function BurnChapter({ project, chapterRef }: ChapterProps) {
  const slide = qe(0, 0.18);
  const burn = qe(0.36, 0.52);
  const doorOpen = qe(0.68, 0.78);
  const fall = qe(0.78, 0.9);
  const doorShut = qe(0.9, 0.96);

  return (
    <div ref={chapterRef} className="chapter">
      {/* trapdoor — 1.75x the plate, living behind everything */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 border border-foreground/45"
        style={{ opacity: `calc(${q(0.64, 0.7)} - ${q(0.96, 1)})` }}
      >
        <span
          className="absolute inset-y-0 left-0 w-1/2 origin-left border-r border-foreground/30 bg-background"
          style={{
            transform: `perspective(1400px) rotateY(${`calc((${doorOpen} - ${doorShut}) * -78deg)`})`,
          }}
        />
        <span
          className="absolute inset-y-0 right-0 w-1/2 origin-right border-l border-foreground/30 bg-background"
          style={{
            transform: `perspective(1400px) rotateY(${`calc((${doorOpen} - ${doorShut}) * 78deg)`})`,
          }}
        />
      </div>

      <div
        className="absolute inset-[6%]"
        style={{
          transform:
            `translate3d(${pct(`(1 - ${slide}) * 1.2`)}, ${pct(`${fall} * 1.4`)}, 0) ` +
            `scale(calc(1 - ${fall} * 0.72)) rotate(calc(${fall} * 14deg))`,
          opacity: `calc(1 - ${q(0.88, 0.95)})`,
        }}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <div style={{ opacity: q(0.34, 0.42) }}>
            <ProjectPlaque project={project} />
          </div>
          {/* the blank canvas, eaten by flash-fire from the lower-left */}
          <span
            aria-hidden
            className="absolute inset-0 bg-foreground"
            style={{
              WebkitMaskImage: `radial-gradient(circle at 6% 94%, transparent ${pct(`${burn} * 1.55`)}, #000 ${pct(`${burn} * 1.55 + 0.04`)})`,
              maskImage: `radial-gradient(circle at 6% 94%, transparent ${pct(`${burn} * 1.55`)}, #000 ${pct(`${burn} * 1.55 + 0.04`)})`,
            }}
          />
          {/* the incandescent burn edge */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 chapter-burn-edge"
            style={{
              opacity: `calc(${q(0.34, 0.38)} - ${q(0.5, 0.56)})`,
              ["--burn" as string]: burn,
            }}
          />
        </div>
      </div>
    </div>
  );
}
