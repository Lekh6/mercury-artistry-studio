import { useEffect, useRef } from "react";
import { cursorState } from "@/lib/cursor-state";
import { isLight } from "@/lib/theme";

/**
 * A procedurally generated motherboard that lives, invisible, behind the page.
 * Only a disc around the pointer is painted, so the page stays black and the
 * cost stays proportional to the reveal radius. Everything here is line art
 * drawn in code — traces, vias, chips, RAM, a CPU, small components — laid out
 * organically (dense in places, sparse in others) rather than on a neat grid.
 */

const RADIUS = 165;

type Trace = {
  points: Array<{ x: number; y: number }>;
  /** 0 = faint detail, 1 = primary bus */
  weight: number;
  /** total path length, cached for the draw-in animation */
  length: number;
};

type Via = { x: number; y: number; r: number; weight: number };

type Component = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "cpu" | "ram" | "chip" | "cap" | "resistor" | "cluster";
  seed: number;
};

type Field = {
  traces: Trace[];
  vias: Via[];
  components: Component[];
};

/** Deterministic PRNG so the layout is stable across resizes within a mount. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pathLength(points: Array<{ x: number; y: number }>) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

function buildField(w: number, h: number): Field {
  const rand = mulberry32(0x9e3779b1);
  const traces: Trace[] = [];
  const vias: Via[] = [];
  const components: Component[] = [];

  // ---- Anchor components first; traces will route between their pins. ----
  // A few "regions" of interest scattered organically across the board.
  const regions = 5 + Math.floor(rand() * 3);
  const anchors: Array<{ x: number; y: number }> = [];

  const place = (c: Component) => {
    components.push(c);
    anchors.push({ x: c.x + c.w / 2, y: c.y + c.h / 2 });
  };

  // One large CPU near a random third of the board.
  const cpuS = 108 + rand() * 40;
  place({
    x: w * (0.28 + rand() * 0.35),
    y: h * (0.3 + rand() * 0.35),
    w: cpuS,
    h: cpuS,
    kind: "cpu",
    seed: rand(),
  });

  // A couple of RAM sticks.
  for (let i = 0; i < 2 + Math.floor(rand() * 2); i++) {
    place({
      x: w * (0.08 + rand() * 0.8),
      y: h * (0.08 + rand() * 0.8),
      w: 150 + rand() * 90,
      h: 34 + rand() * 12,
      kind: "ram",
      seed: rand(),
    });
  }

  // Assorted chips, capacitors, resistors, clusters.
  const smallKinds: Component["kind"][] = ["chip", "cap", "resistor", "cluster", "chip", "cap"];
  const smallCount = regions * 4 + 10;
  for (let i = 0; i < smallCount; i++) {
    const kind = smallKinds[Math.floor(rand() * smallKinds.length)];
    const size =
      kind === "chip" ? 30 + rand() * 34 : kind === "cluster" ? 22 + rand() * 20 : 12 + rand() * 12;
    place({
      x: rand() * (w - size),
      y: rand() * (h - size),
      w: kind === "resistor" ? size * 2.2 : size,
      h: kind === "cap" ? size : size * (0.6 + rand() * 0.6),
      kind,
      seed: rand(),
    });
  }

  // ---- Vias sprinkled across the board, denser near anchors. ----
  for (let i = 0; i < 90; i++) {
    vias.push({
      x: rand() * w,
      y: rand() * h,
      r: 1.3 + rand() * 1.8,
      weight: rand(),
    });
  }
  for (const a of anchors) {
    const ring = 3 + Math.floor(rand() * 4);
    for (let i = 0; i < ring; i++) {
      const ang = rand() * Math.PI * 2;
      const dr = 26 + rand() * 60;
      vias.push({
        x: a.x + Math.cos(ang) * dr,
        y: a.y + Math.sin(ang) * dr,
        r: 1.6 + rand() * 1.6,
        weight: 0.5 + rand() * 0.5,
      });
    }
  }

  // ---- Traces: Manhattan-style routes with 45° elbows between vias/anchors. ----
  const nodes = [...anchors, ...vias.map((v) => ({ x: v.x, y: v.y }))];

  const routeBetween = (a: { x: number; y: number }, b: { x: number; y: number }, weight: number) => {
    const points: Array<{ x: number; y: number }> = [{ x: a.x, y: a.y }];
    // Elbow with a chamfered corner — the classic PCB trace look.
    const midX = a.x + (b.x - a.x) * (0.4 + rand() * 0.3);
    const chamfer = Math.min(Math.abs(b.y - a.y), 14) * (b.y > a.y ? 1 : -1);
    points.push({ x: midX, y: a.y });
    points.push({ x: midX + (b.x > a.x ? 10 : -10), y: a.y + chamfer });
    points.push({ x: midX + (b.x > a.x ? 10 : -10), y: b.y });
    points.push({ x: b.x, y: b.y });
    traces.push({ points, weight, length: pathLength(points) });
  };

  // Primary buses: connect each anchor to a couple of nearby anchors.
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const links = 1 + Math.floor(rand() * 2);
    const others = anchors
      .map((o, j) => ({ o, j, d: Math.hypot(o.x - a.x, o.y - a.y) }))
      .filter((c) => c.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, links);
    for (const c of others) routeBetween(a, c.o, 0.75 + rand() * 0.25);
  }

  // Secondary detail traces: short branches from random nodes that sometimes
  // terminate in the middle of nowhere (as real traces do).
  for (let i = 0; i < nodes.length * 0.7; i++) {
    const a = nodes[Math.floor(rand() * nodes.length)];
    const ang = rand() * Math.PI * 2;
    const len = 24 + rand() * 70;
    const b = { x: a.x + Math.cos(ang) * len, y: a.y + Math.sin(ang) * len };
    routeBetween(a, b, 0.18 + rand() * 0.3);
  }

  return { traces, vias, components };
}

/** Draw a component as line art. Coordinates are absolute. */
function drawComponent(ctx: CanvasRenderingContext2D, c: Component, ink: string, intensity: number) {
  const a = intensity;
  ctx.save();
  ctx.strokeStyle = `rgba(${ink}, ${0.55 * a})`;
  ctx.fillStyle = `rgba(${ink}, ${0.08 * a})`;
  ctx.lineWidth = 1;

  if (c.kind === "cpu") {
    // Body
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    // Bright inner die
    ctx.strokeStyle = `rgba(${ink}, ${0.9 * a})`;
    const pad = c.w * 0.2;
    ctx.strokeRect(c.x + pad, c.y + pad, c.w - pad * 2, c.h - pad * 2);
    // Internal geometric traces
    ctx.strokeStyle = `rgba(${ink}, ${0.4 * a})`;
    for (let i = 1; i < 4; i++) {
      const gx = c.x + pad + ((c.w - pad * 2) / 4) * i;
      ctx.beginPath();
      ctx.moveTo(gx, c.y + pad);
      ctx.lineTo(gx, c.y + c.h - pad);
      ctx.stroke();
    }
    // Pins on all four sides
    ctx.strokeStyle = `rgba(${ink}, ${0.7 * a})`;
    const pins = 10;
    for (let i = 0; i < pins; i++) {
      const t = c.x + (c.w / pins) * (i + 0.5);
      line(ctx, t, c.y, t, c.y - 6);
      line(ctx, t, c.y + c.h, t, c.y + c.h + 6);
      const s = c.y + (c.h / pins) * (i + 0.5);
      line(ctx, c.x, s, c.x - 6, s);
      line(ctx, c.x + c.w, s, c.x + c.w + 6, s);
    }
  } else if (c.kind === "ram") {
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    // Repeated memory blocks
    const blocks = Math.max(4, Math.floor(c.w / 26));
    for (let i = 0; i < blocks; i++) {
      const bx = c.x + 4 + ((c.w - 8) / blocks) * i;
      ctx.strokeRect(bx, c.y + 5, (c.w - 8) / blocks - 3, c.h - 16);
    }
    // Connection pins along the bottom edge
    ctx.strokeStyle = `rgba(${ink}, ${0.65 * a})`;
    const pins = Math.floor(c.w / 6);
    for (let i = 0; i < pins; i++) {
      const px = c.x + (c.w / pins) * (i + 0.5);
      line(ctx, px, c.y + c.h, px, c.y + c.h + 5);
    }
  } else if (c.kind === "chip") {
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    // Notch (pin-1 marker)
    ctx.beginPath();
    ctx.arc(c.x + 5, c.y + 5, 2, 0, Math.PI * 2);
    ctx.stroke();
    const per = Math.max(3, Math.floor(c.h / 8));
    ctx.strokeStyle = `rgba(${ink}, ${0.6 * a})`;
    for (let i = 0; i < per; i++) {
      const py = c.y + (c.h / per) * (i + 0.5);
      line(ctx, c.x, py, c.x - 5, py);
      line(ctx, c.x + c.w, py, c.x + c.w + 5, py);
    }
  } else if (c.kind === "cap") {
    // Electrolytic capacitor: circle with a polarity mark
    const r = Math.min(c.w, c.h) / 2;
    const cx = c.x + r;
    const cy = c.y + r;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, cx - r * 0.4, cy, cx + r * 0.4, cy);
  } else if (c.kind === "resistor") {
    // Small SMD body with two leads
    const bodyW = c.w * 0.5;
    const bx = c.x + (c.w - bodyW) / 2;
    ctx.fillRect(bx, c.y, bodyW, c.h);
    ctx.strokeRect(bx, c.y, bodyW, c.h);
    line(ctx, c.x, c.y + c.h / 2, bx, c.y + c.h / 2);
    line(ctx, bx + bodyW, c.y + c.h / 2, c.x + c.w, c.y + c.h / 2);
  } else {
    // cluster: a knot of tiny pads / transistor-like triples
    const rand = mulberry32(Math.floor(c.seed * 1e6));
    const n = 4 + Math.floor(rand() * 5);
    for (let i = 0; i < n; i++) {
      const px = c.x + rand() * c.w;
      const py = c.y + rand() * c.h;
      ctx.strokeRect(px, py, 3, 3);
      if (rand() > 0.5) line(ctx, px + 1.5, py + 3, px + 1.5, py + 8);
    }
  }
  ctx.restore();
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function CircuitField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let field: Field = { traces: [], vias: [], components: [] };
    let dpr = 1;
    /** Per-region activation time so newly revealed areas draw themselves in. */
    const activatedAt = new Map<string, number>();

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      field = buildField(window.innerWidth, window.innerHeight);
      activatedAt.clear();
    };

    build();
    window.addEventListener("resize", build);

    /** Grid of activation cells so the "draw-in" only happens once per area. */
    const CELL = 70;
    const activation = (x: number, y: number, now: number) => {
      const key = `${Math.floor(x / CELL)}:${Math.floor(y / CELL)}`;
      let at = activatedAt.get(key);
      if (at === undefined) {
        at = now;
        activatedAt.set(key, at);
      }
      // 0 -> 1 over 520ms, then holds at 1 while revealed.
      return Math.min(1, (now - at) / 520);
    };

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      if (!cursorState.has) return;

      const now = performance.now();
      const px = cursorState.x;
      const py = cursorState.y;
      // Brighter than the old binary field, but still below the cursor.
      const ink = isLight() ? "20, 24, 30" : "228, 234, 240";

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Soft radial reveal mask: draw everything, but modulate alpha by the
      // distance from the pointer so it dissolves into black at the edge.
      const falloffAt = (x: number, y: number) => {
        const d = Math.hypot(x - px, y - py);
        if (d > RADIUS) return 0;
        return Math.pow(1 - d / RADIUS, 1.5);
      };

      // ---- Traces ----
      for (const t of field.traces) {
        // Cheap cull: skip traces whose first point is far outside the disc.
        const mid = t.points[Math.floor(t.points.length / 2)];
        if (Math.hypot(mid.x - px, mid.y - py) > RADIUS + 60) continue;

        for (let i = 1; i < t.points.length; i++) {
          const a = t.points[i - 1];
          const b = t.points[i];
          const cx = (a.x + b.x) / 2;
          const cy = (a.y + b.y) / 2;
          const f = falloffAt(cx, cy);
          if (f <= 0.02) continue;
          const act = activation(cx, cy, now);
          const alpha = f * (0.18 + t.weight * 0.6) * act;
          if (alpha <= 0.02) continue;
          ctx.strokeStyle = `rgba(${ink}, ${alpha})`;
          ctx.lineWidth = 0.6 + t.weight * 1.3;
          line(ctx, a.x, a.y, b.x, b.y);
        }
      }

      // ---- Vias / solder pads ----
      for (const v of field.vias) {
        const f = falloffAt(v.x, v.y);
        if (f <= 0.02) continue;
        const act = activation(v.x, v.y, now);
        const alpha = f * (0.4 + v.weight * 0.5) * act;
        ctx.strokeStyle = `rgba(${ink}, ${alpha})`;
        ctx.fillStyle = `rgba(${ink}, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // ---- Components ----
      for (const c of field.components) {
        const cx = c.x + c.w / 2;
        const cy = c.y + c.h / 2;
        // Only cull when the whole part is well outside the disc.
        if (Math.hypot(cx - px, cy - py) > RADIUS + Math.max(c.w, c.h)) continue;
        const f = falloffAt(cx, cy);
        if (f <= 0.02) continue;
        const act = activation(cx, cy, now);
        drawComponent(ctx, c, ink, f * act);
      }
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, []);

  return <canvas ref={canvasRef} className="discovery-field" aria-hidden />;
}
