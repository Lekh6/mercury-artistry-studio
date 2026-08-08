import { useEffect, useRef } from "react";

type Particle = {
  hx: number;
  hy: number;
  dx: number;
  dy: number;
  size: number;
  tone: number;
  delay: number;
};

const DENSITY = 1 / 2600; // particles per px², capped below

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
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    stageRef.current = stage;
    startRef.current = performance.now();
  }, [stage]);

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

    const count = Math.min(1400, Math.floor(w * h * DENSITY));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const reach = 40 + Math.random() * 180;
      particles.push({
        hx: Math.random() * w,
        hy: Math.random() * h,
        dx: Math.cos(angle) * reach,
        dy: Math.sin(angle) * reach - 30,
        size: 0.7 + Math.random() * 1.8,
        tone: 0.45 + Math.random() * 0.55,
        delay: Math.random() * 0.32,
      });
    }
    particlesRef.current = particles;

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      ctx.clearRect(0, 0, w, h);
      const current = stageRef.current;
      if (!current) return;

      const t = Math.min(1, (performance.now() - startRef.current) / duration);
      for (const p of particles) {
        const local = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)));
        const eased = local * local * (3 - 2 * local);
        const spread = current === "dust" ? eased : 1 - eased;
        const alpha = (current === "dust" ? eased : 1 - eased) * 0.85;
        if (alpha <= 0.01) continue;
        const x = p.hx + p.dx * spread;
        const y = p.hy + p.dy * spread + spread * spread * 26;
        ctx.fillStyle = `rgba(${Math.round(120 + p.tone * 120)}, ${Math.round(
          124 + p.tone * 122,
        )}, ${Math.round(130 + p.tone * 122)}, ${alpha})`;
        ctx.fillRect(x, y, p.size, p.size);
      }
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return <canvas ref={canvasRef} className="particle-veil" aria-hidden />;
}
