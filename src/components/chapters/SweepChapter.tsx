import { q, qe, pct } from "@/lib/stage/css";
import { ProjectPlaque, type ChapterProps } from "./shared";

/**
 * PROJECT 04 — THE COMPASS SWEEP.
 * The creature pins itself to the centre and swings a radial arm around the
 * plate like a compass, erasing the white in a single 360° sweep and leaving
 * the project drawn behind it. EXIT: the surface drains into a hairline.
 */
export function SweepChapter({ project, chapterRef }: ChapterProps) {
  const sweep = qe(0.24, 0.7);
  const drain = qe(0.86, 1);

  return (
    <div ref={chapterRef} className="chapter">
      <div
        className="absolute inset-[6%]"
        style={{
          transform: `scaleY(calc(1 - ${drain} * 0.995))`,
          opacity: `calc(1 - ${q(0.97, 1)})`,
        }}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <div style={{ opacity: q(0.34, 0.5) }}>
            <ProjectPlaque project={project} />
          </div>

          <span
            aria-hidden
            className="absolute inset-0 bg-foreground"
            style={{
              WebkitMaskImage: `conic-gradient(from -90deg, transparent 0 calc(${sweep} * 360deg), #000 0)`,
              maskImage: `conic-gradient(from -90deg, transparent 0 calc(${sweep} * 360deg), #000 0)`,
              opacity: q(0.1, 0.2),
            }}
          />
          {/* the compass arm */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-px w-[75%] origin-left bg-foreground/70"
            style={{
              transform: `rotate(calc(-90deg + ${sweep} * 360deg))`,
              opacity: `calc(${q(0.2, 0.26)} - ${q(0.68, 0.74)})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
