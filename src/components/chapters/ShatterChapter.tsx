import { q, qe, pct } from "@/lib/stage/css";
import { ProjectPlaque, type ChapterProps } from "./shared";

/**
 * PROJECT 03 — CRYSTALLISE & SHED.
 * The creature freezes the blank plate into a lattice of white shards, then
 * flicks them off the surface one band at a time, each shard sliding, tipping
 * and shrinking out of existence. EXIT: the creature inhales the project.
 */
const COLS = 7;
const ROWS = 4;
const tiles = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  // diagonal stagger so the shards leave as a travelling wave
  const d = (c / (COLS - 1)) * 0.55 + (r / (ROWS - 1)) * 0.2;
  return { i, c, r, d };
});

export function ShatterChapter({ project, chapterRef }: ChapterProps) {
  const inhale = qe(0.88, 1);

  return (
    <div ref={chapterRef} className="chapter">
      <div
        className="absolute inset-[6%]"
        style={{
          transform: `scale(calc(1 - ${inhale} * 0.94)) translate3d(0, ${pct(`${inhale} * -0.4`)}, 0)`,
          opacity: `calc(1 - ${q(0.94, 1)})`,
        }}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <div style={{ opacity: q(0.3, 0.42) }}>
            <ProjectPlaque project={project} />
          </div>
          {tiles.map(({ i, c, r, d }) => {
            const start = 0.26 + d * 0.42;
            const t = qe(start, start + 0.14);
            return (
              <span
                key={i}
                aria-hidden
                className="absolute bg-foreground"
                style={{
                  left: `${(c / COLS) * 100}%`,
                  top: `${(r / ROWS) * 100}%`,
                  width: `${100 / COLS + 0.15}%`,
                  height: `${100 / ROWS + 0.2}%`,
                  transform:
                    `translate3d(${pct(`${t} * ${(c - COLS / 2) * 0.2}`)}, ${pct(`${t} * ${(r - ROWS / 2) * 0.3 - 0.22}`)}, 0) ` +
                    `rotate(calc(${t} * ${(i % 5) - 2}deg)) scale(calc(1 - ${t} * 0.55))`,
                  opacity: `calc((1 - ${t}) * ${q(0.06, 0.14)})`,
                  // hairline fracture between shards as they separate
                  outline: "1px solid transparent",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
