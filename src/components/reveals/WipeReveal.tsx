import { useEffect, useRef, useState } from "react";
import { claimBlob, releaseBlob } from "@/lib/entity/blob";
import { useInView } from "./useInView";
import type { RevealProps } from "@/lib/reveals/types";

/**
 * "Wipe" reveal — the reverse of selecting text.
 * The entity flattens into a solid bar over the text, then the bar retracts
 * horizontally, leaving the glyphs behind. Nothing fades.
 */
export function WipeReveal({
  children,
  id,
  delay = 0,
  restSide = "left",
  className,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;
    const push = (fn: () => void, ms: number) =>
      timers.current.push(window.setTimeout(fn, ms));

    push(() => {
      const r = el.getBoundingClientRect();
      claimBlob(id, {
        x: r.left,
        y: r.top + r.height / 2,
        size: r.height * 0.34,
        urgency: 0.85,
      });
      setPlaying(true);
      push(() => {
        const b = el.getBoundingClientRect();
        claimBlob(id, {
          x: restSide === "left" ? b.left - 44 : b.right + 44,
          y: b.top + b.height / 2,
          size: b.height * 0.16,
          urgency: 0.6,
        });
      }, 1100);
      push(() => releaseBlob(id), 2400);
    }, delay);

    return () => {
      timers.current.forEach(clearTimeout);
      releaseBlob(id);
    };
  }, [inView, id, delay, restSide, ref]);

  return (
    <div ref={ref} className={`relative inline-block ${className ?? ""}`}>
      <div className={playing ? "reveal-wipe-text" : "opacity-0"}>{children}</div>
      {playing && <span aria-hidden className="reveal-wipe-bar" />}
    </div>
  );
}
