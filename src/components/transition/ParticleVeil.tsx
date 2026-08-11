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
    // Pure opposite of the background, with subtle grayscale variation so the
    // dust has depth. Dark world -> bright whites; light world -> deep blacks.
    const base = light ? 6 : 168;
    const range = light ? 96 : 87;

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

        let x: number;
        let y: number;
        let alpha: number;
        if (current === "dust") {
          // The negative surface loses cohesion: pieces detach, drift outward
          // with a little gravity, and fade. Staggered delays keep them from
          // all vanishing at once.
          x = p.hx + p.dx * eased;
          y = p.hy + p.dy * eased + eased * eased * 16;
          alpha = 1 - eased;
        } else {
          // Reconstruction: the same matter converges back from where it
          // scattered to its home, brightening then dissolving into the sharp,
          // now-visible page.
          x = p.hx + p.dx * (1 - eased);
          y = p.hy + p.dy * (1 - eased);
          alpha = Math.sin(Math.PI * eased) * 0.5;
        }

        if (alpha <= 0.02) continue;
        const channel = Math.round(base + p.tone * range);
        ctx.fillStyle = `rgba(${channel}, ${channel + 3}, ${channel + 5}, ${alpha})`;
        ctx.fillRect(x, y, p.size, p.size);
      }
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="particle-veil" aria-hidden />;
}
