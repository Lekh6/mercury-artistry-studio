import { useEffect, useRef } from "react";
import { cursorState } from "@/lib/cursor-state";
import { aboutIcons, resumeIcons, type IconDraw } from "@/lib/discovery/icons";
import { isLight } from "@/lib/theme";

type Mode = "about" | "resume";

const RADIUS = 130;

type Cell = {
  x: number;
  y: number;
  /** binary: char value. icons: index into the icon set */
  value: number;
  rotation: number;
  scale: number;
  discovered: boolean;
  /** timestamp (ms) at which the discovery animation ends */
  settleAt: number;
  seed: number;
};

/**
 * A single canvas that paints an otherwise invisible layer of information.
 * Only the disc around the pointer is drawn, so the page stays black and the
 * cost stays proportional to that disc rather than the viewport.
 */
export function DiscoveryField({ mode }: { mode: Mode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const icons: IconDraw[] = mode === "about" ? aboutIcons : resumeIcons;
    const stepX = 104;
    const stepY = 104;

    let cells: Cell[] = [];
    let cols = 0;
    let dpr = 1;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(window.innerWidth / stepX) + 1;
      const rows = Math.ceil(window.innerHeight / stepY) + 1;
      cells = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const jitter = (Math.random() - 0.5) * stepX * 0.45;
          cells.push({
            x: col * stepX + stepX / 2 + jitter,
            y: row * stepY + stepY / 2 + (Math.random() - 0.5) * stepY * 0.45,
            value: Math.floor(Math.random() * icons.length),
            rotation: (Math.random() - 0.5) * 0.5,
            scale: 0.7 + Math.random() * 0.6,
            discovered: false,
            settleAt: 0,
            seed: Math.random(),
          });
        }
      }
    };

    build();
    window.addEventListener("resize", build);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      if (!cursorState.has) return;

      const now = performance.now();
      const ink = isLight() ? "18, 22, 26" : "233, 238, 242";
      const px = cursorState.x;
      const py = cursorState.y;

      const minCol = Math.max(0, Math.floor((px - RADIUS - stepX) / stepX));
      const maxCol = Math.floor((px + RADIUS + stepX) / stepX);
      const minRow = Math.max(0, Math.floor((py - RADIUS - stepY) / stepY));
      const maxRow = Math.floor((py + RADIUS + stepY) / stepY);

      ctx.font = "500 13px ui-monospace, SFMono-Regular, monospace";
      ctx.lineWidth = 1.15;

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cell = cells[row * cols + col];
          if (!cell) continue;
          const dx = cell.x - px;
          const dy = cell.y - py;
          const dist = Math.hypot(dx, dy);
          if (dist > RADIUS) continue;

          const falloff = Math.pow(1 - dist / RADIUS, 1.6);
          if (!cell.discovered) {
            cell.discovered = true;
            cell.settleAt = now + 180 + cell.seed * 260;
          }
          const scrambling = now < cell.settleAt;

          const t = scrambling
            ? Math.max(0, 1 - (cell.settleAt - now) / (180 + cell.seed * 260))
            : 1;
          const eased = t * t * (3 - 2 * t);
          const k = cell.scale * (0.86 + eased * 0.14) * 1.5;
          ctx.save();
          ctx.translate(cell.x, cell.y);
          ctx.rotate(cell.rotation * (2 - eased));
          ctx.scale(k, k);
          ctx.translate(-12, -12);
          ctx.strokeStyle = `rgba(${ink}, ${falloff * 0.32 * (0.3 + eased * 0.7)})`;
          ctx.lineWidth = 1.15 / k;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          icons[cell.value % icons.length]?.(ctx);
          ctx.restore();
        }
      }
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="discovery-field" aria-hidden />;
}
