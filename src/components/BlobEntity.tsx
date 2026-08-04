import { useEffect, useRef } from "react";
import { activeTarget, setIdleTarget } from "@/lib/entity/blob";

/**
 * Renders the white entity. A single GPU-composited element driven by one
 * rAF loop: critically-ish damped spring position, velocity-derived
 * squash-and-stretch, idle breathing, and an organic eyelid blink.
 */
export function BlobEntity() {
  const ref = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const lid = lidRef.current;
    if (!el || !lid) return;

    setIdleTarget({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let vx = 0;
    let vy = 0;
    let size = 26;
    let opacity = 1;

    let t = 0;
    let nextBlink = 2.2;
    let blinkAt = -1;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      t += dt;

      const target = activeTarget();
      const urgency = target.urgency ?? 0.25;

      // spring — heavy, elegant, slight overshoot
      const stiffness = 60 + urgency * 220;
      const damping = 2 * Math.sqrt(stiffness) * 0.72;
      vx += (target.x - x) * stiffness * dt - vx * damping * dt;
      vy += (target.y - y) * stiffness * dt - vy * damping * dt;
      x += vx * dt;
      y += vy * dt;

      size += ((target.size ?? 26) - size) * Math.min(1, dt * 6);
      const targetOpacity = target.hidden ? 0 : 1;
      opacity += (targetOpacity - opacity) * Math.min(1, dt * 10);

      // breathing
      const breathe = 1 + Math.sin(t * 1.15) * 0.045;

      // squash & stretch along the direction of travel
      const speed = Math.hypot(vx, vy);
      const stretch = Math.min(speed / 2600, 0.42);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;

      // blink — an eyelid sweeping down and back up
      if (blinkAt < 0 && t > nextBlink) blinkAt = t;
      let lidP = 0;
      if (blinkAt >= 0) {
        const p = (t - blinkAt) / 0.42;
        if (p >= 1) {
          blinkAt = -1;
          nextBlink = t + 3 + Math.random() * 3.5;
        } else {
          const e = p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55;
          lidP = e * e * (3 - 2 * e);
        }
      }

      const d = size * 2;
      el.style.width = `${d}px`;
      el.style.height = `${d}px`;
      el.style.opacity = String(opacity);
      el.style.transform =
        `translate3d(${x - size}px, ${y - size}px, 0) rotate(${angle}deg) ` +
        `scale(${breathe * (1 + stretch)}, ${breathe * (1 - stretch * 0.72) * (1 - lidP * 0.86)}) ` +
        `rotate(${-angle}deg)`;
      // subtle organic wobble of the silhouette
      const w1 = 50 + Math.sin(t * 0.9) * 6;
      const w2 = 50 + Math.cos(t * 1.3) * 6;
      el.style.borderRadius = `${w1}% ${100 - w1}% ${w2}% ${100 - w2}% / ${w2}% ${w1}% ${100 - w1}% ${100 - w2}%`;

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    const onResize = () =>
      setIdleTarget({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        ref={ref}
        className="absolute left-0 top-0 bg-foreground will-change-transform"
      />
      <div ref={lidRef} className="hidden" />
    </div>
  );
}
