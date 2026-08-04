import { useEffect, useRef, useState } from "react";
import { claimBlob, releaseBlob } from "@/lib/entity/blob";
import { useInView } from "./useInView";
import type { RevealProps } from "@/lib/reveals/types";

/**
 * "Drag select" reveal — the entity snaps to a corner of an invisible
 * rectangle, drags diagonally like a screenshot selection, and the resulting
 * white plate melts upward to leave the exhibit behind.
 */
export function DragSelectReveal({
  children,
  id,
  delay = 0,
  restSide = "left",
  className,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [phase, setPhase] = useState<"idle" | "drag" | "melt" | "done">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;
    const push = (fn: () => void, ms: number) =>
      timers.current.push(window.setTimeout(fn, ms));

    push(() => {
      const r = el.getBoundingClientRect();
      claimBlob(id, { x: r.left, y: r.top, size: 18, urgency: 0.95 });
      push(() => {
        setPhase("drag");
        const b = el.getBoundingClientRect();
        claimBlob(id, { x: b.right, y: b.bottom, size: 14, urgency: 0.5 });
      }, 320);
      push(() => setPhase("melt"), 1120);
      push(() => {
        const b = el.getBoundingClientRect();
        claimBlob(id, {
          x: restSide === "left" ? b.left - 56 : b.right + 56,
          y: b.top + b.height / 2,
          size: 22,
          urgency: 0.4,
        });
      }, 1400);
      push(() => {
        setPhase("done");
        releaseBlob(id);
      }, 2600);
    }, delay);

    return () => {
      timers.current.forEach(clearTimeout);
      releaseBlob(id);
    };
  }, [inView, id, delay, restSide, ref]);

  const contentVisible = phase === "melt" || phase === "done";

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <div className={contentVisible ? "reveal-content-in" : "opacity-0"}>
        {children}
      </div>
      {(phase === "drag" || phase === "melt") && (
        <span
          aria-hidden
          className={
            phase === "drag" ? "reveal-plate reveal-plate-grow" : "reveal-plate reveal-plate-melt"
          }
        />
      )}
    </div>
  );
}
