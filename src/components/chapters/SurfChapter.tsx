import { q, qe, pct } from "@/lib/stage/css";
import { ProjectPlaque, type ChapterProps } from "./shared";

/**
 * PROJECT 01 — THE SURF.
 * The creature surfs in on a wave of thick white ink (drawn on the canvas
 * engine). The wave crashes across a blank plate; as the liquid settles the
 * plate melts upward and the project is left painted underneath.
 * EXIT: the creature shoves the whole plate off to the left.
 */
export function SurfChapter({ project, chapterRef }: ChapterProps) {
  const melt = qe(0.46, 0.66);
  const exit = qe(0.8, 1);

  return (
    <div
      ref={chapterRef}
      className="chapter"
      style={{ transform: `translate3d(${pct(`${exit} * -1.15`)}, 0, 0)` }}
    >
      <div className="absolute inset-[6%] flex items-center justify-center">
        <div className="relative flex h-full w-full items-center justify-center">
          <div style={{ opacity: q(0.44, 0.52) }}>
            <ProjectPlaque project={project} />
          </div>
          <span
            aria-hidden
            className="absolute inset-0 bg-foreground"
            style={{
              clipPath: `inset(0 0 ${pct(melt)} 0)`,
              opacity: q(0.3, 0.34),
            }}
          />
        </div>
      </div>
    </div>
  );
}
