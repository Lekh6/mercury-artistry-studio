import { useEffect, useRef } from "react";
import { cursorState } from "@/lib/cursor-state";
import { shearState } from "@/lib/shear-state";
import { isLight } from "@/lib/theme";

type Point = { x: number; y: number };

type Path = {
  pts: Point[];
  /** which copy of space this path belongs to; layers shear apart */
  layer: number;
  seed: number;
  /** smoothed local disturbance, 0..1 — drives everything, including recovery */
  energy: number;
  /** paths flagged for impossible re-entry */
  folds: boolean;
};

const RADIUS = 250;
const COUNT = 34;

/**
 * A hidden geometric environment. At rest it is invisible and the canvas is
 * blank; only the neighbourhood of the pointer is ever drawn. Nothing here
 * animates on its own — every frame is a function of the pointer, so when the
 * pointer stops and the field recovers, drawing stops entirely.
 */
export function DimensionalShear() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    let paths: Path[] = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      paths = [];
      for (let i = 0; i < COUNT; i++) {
        // Irregular trajectories: a wandering polyline, never a grid.
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        let angle = Math.random() * Math.PI * 2;
        const segments = 3 + Math.floor(Math.random() * 4);
        const pts: Point[] = [{ x: startX, y: startY }];
        for (let s = 0; s < segments; s++) {
          angle += (Math.random() - 0.5) * 1.5;
          const len = 90 + Math.random() * 260;
          const prev = pts[pts.length - 1]!;
          pts.push({ x: prev.x + Math.cos(angle) * len, y: prev.y + Math.sin(angle) * len });
        }
        paths.push({
          pts,
          layer: i % 3,
          seed: Math.random(),
          energy: 0,
          folds: Math.random() < 0.34,
        });
      }
    };

    build();
    window.addEventListener("resize", build);

    let raf = 0;
    let idle = false;

    const render = () => {
      raf = requestAnimationFrame(render);

      const pullActive = shearState.pull > 0.001;
      const px = pullActive ? shearState.x : cursorState.x;
      const py = pullActive ? shearState.y : cursorState.y;
      const reach = pullActive ? Math.hypot(w, h) : RADIUS;
      const gain = pullActive ? shearState.pull : cursorState.has ? 1 : 0;

      const now = performance.now();
      const ink = isLight() ? "8, 10, 12" : "244, 247, 250";

      let anyEnergy = false;
      // 1. update smoothed energies (this is the recovery model)
      for (const path of paths) {
        let target = 0;
        for (const p of path.pts) {
          const d = Math.hypot(p.x - px, p.y - py);
          if (d < reach) target = Math.max(target, (1 - d / reach) * gain);
        }
        path.energy += (target - path.energy) * (target > path.energy ? 0.16 : 0.075);
        if (path.energy < 0.002) path.energy = 0;
        if (path.energy > 0) anyEnergy = true;
      }

      if (!anyEnergy) {
        // Nothing disturbed: leave the page truly empty and stop painting.
        if (!idle) {
          ctx.clearRect(0, 0, w, h);
          idle = true;
        }
        return;
      }
      idle = false;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const path of paths) {
        const e = path.energy;
        if (e <= 0) continue;

        // Stage 2 — layers of space slide out of alignment near the pointer.
        const shear = e * e * (2.5 + path.layer * 3.4);
        const sa = path.seed * Math.PI * 2 + path.layer * 1.9;
        const ox = Math.cos(sa) * shear;
        const oy = Math.sin(sa) * shear;

        const warped = path.pts.map((p) => {
          const dx = p.x - px;
          const dy = p.y - py;
          const d = Math.hypot(dx, dy) || 1;
          // Stage 1 — the path bends toward the disturbance, strongest close in.
          const f = Math.max(0, 1 - d / reach);
          const bend = f * f * (pullActive ? 260 * shearState.pull : 46);
          return { x: p.x - (dx / d) * bend + ox, y: p.y - (dy / d) * bend + oy };
        });

        ctx.strokeStyle = `rgba(${ink}, ${(0.05 + e * 0.3).toFixed(3)})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(warped[0]!.x, warped[0]!.y);
        for (let i = 1; i < warped.length; i++) ctx.lineTo(warped[i]!.x, warped[i]!.y);
        ctx.stroke();

        // Stage 3 — impossible topology. The tail of the path terminates and
        // continues from the point diametrically opposite the aperture: a
        // coherent reflection through the disturbance, not random noise.
        if (path.folds && e > 0.45) {
          const tail = warped[warped.length - 1]!;
          const head = warped[0]!;
          const exit = { x: 2 * px - tail.x, y: 2 * py - tail.y };
          const fold = Math.min(1, (e - 0.45) / 0.45);
          ctx.strokeStyle = `rgba(${ink}, ${(fold * 0.26).toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(exit.x, exit.y);
          ctx.lineTo(
            exit.x + (head.x - exit.x) * fold * 0.6,
            exit.y + (head.y - exit.y) * fold * 0.6,
          );
          ctx.stroke();

          // A displaced fragment: a mark that belongs to some adjacent space.
          if (e > 0.72) {
            const drift = Math.sin(now / 520 + path.seed * 9) * 3;
            ctx.strokeStyle = `rgba(${ink}, ${((e - 0.72) * 0.7).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(exit.x + drift, exit.y - 5);
            ctx.lineTo(exit.x + drift, exit.y + 5);
            ctx.stroke();
          }
        }
      }
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      ctx.clearRect(0, 0, w, h);
      paths = [];
    };
  }, []);

  return <canvas ref={canvasRef} className="dimensional-shear" aria-hidden />;
}
