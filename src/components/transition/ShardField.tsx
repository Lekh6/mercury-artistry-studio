import { useEffect, useRef } from "react";
import { isLight } from "@/lib/theme";

type Shard = {
  /** polygon in local space, around its own centre */
  pts: Array<{ x: number; y: number }>;
  cx: number;
  cy: number;
  delay: number;
  spin: number;
};

/**
 * The matter of the transition. One canvas, one shard set, two directions:
 * shards fly out of the aperture and tile the viewport in the opposite of the
 * page colour (destruction), then fly back into it and reveal whatever is
 * mounted underneath (reconstruction). No blur, no fade, no leftovers — the
 * canvas is cleared on every frame and on unmount.
 */
export function ShardField({
  phase,
  origin,
  duration,
}: {
  phase: "shatter" | "reform" | null;
  origin: { x: number; y: number };
  duration: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);
  const originRef = useRef(origin);
  const durationRef = useRef(duration);
  const startRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
    startRef.current = performance.now();
  }, [phase]);
  useEffect(() => { originRef.current = origin; }, [origin]);
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

    // A jittered quad tiling cut into triangles: sharp, engineered pieces that
    // together cover the viewport exactly.
    const cols = Math.max(6, Math.round(w / 130));
    const rows = Math.max(5, Math.round(h / 130));
    const cw = w / cols;
    const ch = h / rows;
    const jitter = (n: number) => (Math.random() - 0.5) * n;

    const shards: Shard[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = c * cw;
        const y0 = r * ch;
        const quad = [
          { x: x0 + jitter(cw * 0.3), y: y0 + jitter(ch * 0.3) },
          { x: x0 + cw + jitter(cw * 0.3), y: y0 + jitter(ch * 0.3) },
          { x: x0 + cw + jitter(cw * 0.3), y: y0 + ch + jitter(ch * 0.3) },
          { x: x0 + jitter(cw * 0.3), y: y0 + ch + jitter(ch * 0.3) },
        ];
        const cut = Math.random() < 0.5 ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]];
        for (const tri of cut) {
          const pts = tri.map((i) => quad[i]!);
          const cx = (pts[0]!.x + pts[1]!.x + pts[2]!.x) / 3;
          const cy = (pts[0]!.y + pts[1]!.y + pts[2]!.y) / 3;
          shards.push({
            pts: pts.map((p) => ({ x: p.x - cx, y: p.y - cy })),
            cx,
            cy,
            delay: 0,
            spin: jitter(0.5),
          });
        }
      }
    }

    // Delay by distance from the aperture: the field opens and closes as a wave.
    const { x: ox, y: oy } = originRef.current;
    const far = Math.hypot(w, h);
    for (const s of shards) {
      s.delay = Math.min(0.5, (Math.hypot(s.cx - ox, s.cy - oy) / far) * 0.62);
    }

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      ctx.clearRect(0, 0, w, h);
      const current = phaseRef.current;
      if (!current) return;

      const ink = isLight() ? "#000000" : "#ffffff";
      const o = originRef.current;
      const t = Math.min(1, (performance.now() - startRef.current) / durationRef.current);
      ctx.fillStyle = ink;

      for (const s of shards) {
        const local = Math.max(0, Math.min(1, (t - s.delay) / (1 - s.delay)));
        const eased = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
        // seated = 1 -> shard is exactly in its home cell (full coverage)
        const seated = current === "shatter" ? eased : 1 - eased;
        if (seated <= 0.001) continue;

        // Slight inertial overshoot as it slams home.
        const over = current === "shatter" ? 1 + (1 - seated) * 0.06 : 1;
        const x = o.x + (s.cx - o.x) * seated;
        const y = o.y + (s.cy - o.y) * seated;
        const k = Math.max(0.001, seated) * over;
        const angle = s.spin * (1 - seated);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(k * 1.04, k * 1.04);
        ctx.beginPath();
        ctx.moveTo(s.pts[0]!.x, s.pts[0]!.y);
        ctx.lineTo(s.pts[1]!.x, s.pts[1]!.y);
        ctx.lineTo(s.pts[2]!.x, s.pts[2]!.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
      shards.length = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className="shard-field" aria-hidden />;
}
