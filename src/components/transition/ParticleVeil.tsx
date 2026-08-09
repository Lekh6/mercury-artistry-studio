import { useEffect, useRef } from "react";
import { isLight } from "@/lib/theme";

type Particle = {
  hx: number;
  hy: number;
  dx: number;
  dy: number;
  size: number;
  tone: number;
  delay: number;
};

const DENSITY = 1 / 2400;

/**
 * The matter of the transition. One canvas, one particle set: the dust that
 * the old page breaks into is the same dust the new page settles out of, so
 * destruction and reconstruction share a single continuous field.
 */
export function ParticleVeil({
  stage,
  duration,
}: {
  stage: "dust" | "rebuild" | null;
  duration: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef(stage);
  const startRef = useRef(0);
  const durationRef = useRef(duration);

  useEffect(() => {
    stageRef.current = stage;
    startRef.current = performance.now();
  }, [stage]);

  useEffect(() => { durationRef.current = duration; }, [duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // A jittered grid rather than pure noise: the field reads as the page
    // coming apart in place instead of a random explosion.
    const target = Math.min(1100, Math.floor(w * h * DENSITY));
    const cols = Math.max(8, Math.round(Math.sqrt((target * w) / h)));
    const rows = Math.max(6, Math.round(target / cols));
    const cellW = w / cols;
    const cellH = h / rows;

    const particles: Particle[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hx = col * cellW + cellW * (0.2 + Math.random() * 0.6);
        const hy = row * cellH + cellH * (0.2 + Math.random() * 0.6);
        // Drift is mostly outward from centre with a light upward bias, so
        // neighbouring particles move coherently.
        const ax = (hx - w / 2) / (w / 2);
        const ay = (hy - h / 2) / (h / 2);
        const reach = 26 + Math.random() * 54;
        particles.push({
          hx,
          hy,
          dx: ax * reach + (Math.random() - 0.5) * 14,
          dy: ay * reach - 16 + (Math.random() - 0.5) * 14,
          size: 0.8 + Math.random() * 1.3,
          tone: 0.45 + Math.random() * 0.55,
          delay: Math.min(0.42, (row / rows) * 0.3 + Math.random() * 0.12),
        });
      }
    }

    const light = isLight();

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      ctx.clearRect(0, 0, w, h);
      const current = stageRef.current;
      if (!current) return;

      const t = Math.min(1, (performance.now() - startRef.current) / durationRef.current);
      for (const p of particles) {
        const local = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)));
        const eased = local * local * (3 - 2 * local);
        const spread = current === "dust" ? eased : 1 - eased;
        const alpha = (current === "dust" ? eased : 1 - eased) * 0.7;
        if (alpha <= 0.015) continue;
        const x = p.hx + p.dx * spread;
        const y = p.hy + p.dy * spread + spread * spread * 14;
        const base = light ? 70 : 130;
        const range = light ? 70 : 118;
        const channel = Math.round(base + p.tone * range);
        ctx.fillStyle = `rgba(${channel}, ${channel + 3}, ${channel + 6}, ${alpha})`;
        ctx.fillRect(x, y, p.size, p.size);
      }
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="particle-veil" aria-hidden />;
}
