import { useEffect, useRef } from "react";
import { Creature, type Command } from "@/lib/entity/creature";
import { HeroChapter } from "./chapters/HeroChapter";
import { SurfChapter } from "./chapters/SurfChapter";
import { BurnChapter } from "./chapters/BurnChapter";
import { ShatterChapter } from "./chapters/ShatterChapter";
import { SweepChapter } from "./chapters/SweepChapter";
import { ContactChapter } from "./chapters/ContactChapter";
import type { Project } from "./chapters/shared";

const projects: Project[] = [
  {
    index: "01",
    title: "Obsidian",
    discipline: "Interaction Design",
    year: "2026",
    note: "A spatial editor built around a single gesture. Everything else disappears.",
  },
  {
    index: "02",
    title: "Silt",
    discipline: "Generative Systems",
    year: "2025",
    note: "Sediment simulated as a typographic medium, rendered entirely in one channel.",
  },
  {
    index: "03",
    title: "Vellum",
    discipline: "Product / Web",
    year: "2025",
    note: "Reading software for archives. Paper physics, no chrome, no colour.",
  },
  {
    index: "04",
    title: "Mercury",
    discipline: "Motion Identity",
    year: "2024",
    note: "An identity that only exists while it is moving. Stillness erases it.",
  },
];

const CHAPTERS = 6; // hero, 4 projects, coda
const SCROLL_PER_CHAPTER = 2.4; // viewport heights

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (t: number) => t * t * (3 - 2 * t);
const win = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The stage. One rAF loop owns everything:
 *   scroll -> smoothed timeline -> chapter progress (CSS vars) -> creature.
 * Chapters never re-render; they read their progress from --p, so the whole
 * experience runs on the compositor.
 */
export function Experience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const creature = new Creature();
    creature.place(w / 2, h * 0.45);

    // timeline state — `g` is the smoothed playhead in chapter units
    let g = 0;
    let raw = 0;
    let last = performance.now();
    let lastScrollAt = -10;
    let clock = 0;
    let prevRaw = 0;
    let splashed = -1;
    let raf = 0;

    const readScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const next = (window.scrollY / max) * CHAPTERS;
      if (Math.abs(next - prevRaw) > 0.0004) lastScrollAt = clock;
      prevRaw = next;
      raw = next;
    };
    readScroll();
    g = raw;
    window.addEventListener("scroll", readScroll, { passive: true });

    const home = () => ({ x: w / 2, y: h * 0.1, r: 26, urgency: 0.3 });

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      clock += dt;

      // The creature "notices" a scroll before it obeys: ~200ms of thought.
      const noticed = clock - lastScrollAt > 0.2 || Math.abs(raw - g) > 0.02;
      if (noticed) {
        const k = 1 - Math.exp(-dt * 3.1);
        g += (raw - g) * k;
      }

      const ci = Math.min(CHAPTERS - 1, Math.floor(g));
      let cmd: Command = home();

      for (let i = 0; i < CHAPTERS; i++) {
        const el = chapterEls.current[i];
        if (!el) continue;
        const p = clamp(g - i);
        el.style.setProperty("--p", p.toFixed(4));
        const near = g > i - 0.9 && g < i + 1.6;
        el.style.opacity = near ? "1" : "0";
        el.style.visibility = near ? "visible" : "hidden";
      }

      ctx.clearRect(0, 0, w, h);

      const p = clamp(g - ci);

      if (ci === 0) {
        // HERO — alone, then travelling left to lay the name
        if (p < 0.14) {
          cmd = { x: w / 2, y: mix(h * 0.45, h * 0.42, p / 0.14), r: 30, urgency: 0.22 };
        } else if (p < 0.56) {
          const line = p < 0.35 ? 0 : 1;
          const t = line === 0 ? win(p, 0.16, 0.34) : win(p, 0.36, 0.54);
          const x0 = w < 768 ? w * 0.06 : w * 0.12;
          cmd = {
            x: mix(x0, x0 + w * 0.62, smooth(t)),
            y: line === 0 ? h * 0.4 : h * 0.56,
            r: 19,
            urgency: 0.55,
          };
        } else {
          cmd = home();
        }
      } else if (ci === 1) {
        // SURF — ride the ink wave in, settle beside the plate, then shove it
        const wv = win(p, 0.02, 0.44);
        const crest = creature.drawWave(ctx, wv, w, h);
        if (p < 0.44) {
          cmd = { x: crest.x, y: crest.y, r: 24, urgency: 0.75 };
        } else if (p < 0.78) {
          cmd = { x: w * 0.08, y: h * 0.5, r: 24, urgency: 0.4 };
        } else {
          const e = smooth(win(p, 0.8, 1));
          cmd = { x: mix(w * 0.93, w * -0.1, e), y: h * 0.5, r: 26, urgency: 0.85 };
        }
        if (wv > 0.62 && splashed !== 1) {
          splashed = 1;
          creature.splash(w * 0.5, h * 0.62, 1.5, -1);
        }
        if (wv < 0.4) splashed = -1;
      } else if (ci === 2) {
        // FLASH PAPER — escort the plate in, strike the lighter, then bury it
        if (p < 0.22) {
          cmd = { x: mix(w * 1.15, w * 0.72, smooth(p / 0.22)), y: h * 0.4, r: 26, urgency: 0.6 };
        } else if (p < 0.6) {
          cmd = { x: w * 0.11, y: h * 0.84, r: 17, urgency: 0.7 };
          if (p > 0.33 && p < 0.56) creature.fire(w * 0.1, h * 0.84, p < 0.42 ? 1 : 2.2);
        } else if (p < 0.92) {
          cmd = { x: w * 0.5, y: mix(h * 0.24, h * 0.62, smooth(win(p, 0.74, 0.9))), r: 28, urgency: 0.55 };
        } else {
          cmd = home();
        }
      } else if (ci === 3) {
        // CRYSTALLISE — orbit the plate flicking shards off, then inhale it
        if (p > 0.2 && p < 0.76) {
          const a = -Math.PI / 2 + smooth(win(p, 0.2, 0.76)) * Math.PI * 2;
          const rad = Math.min(w, h) * 0.42;
          cmd = {
            x: w / 2 + Math.cos(a) * rad * 1.25,
            y: h / 2 + Math.sin(a) * rad * 0.86,
            r: 20,
            urgency: 0.6,
          };
        } else if (p >= 0.86) {
          cmd = { x: w / 2, y: mix(h / 2, h * 0.1, smooth(win(p, 0.88, 1))), r: mix(24, 32, win(p, 0.88, 1)), urgency: 0.5 };
        } else {
          cmd = { x: w / 2, y: h * 0.12, r: 26, urgency: 0.35 };
        }
      } else if (ci === 4) {
        // COMPASS — the creature is the pen at the end of the sweeping arm
        if (p > 0.2 && p < 0.74) {
          const a = -Math.PI / 2 + smooth(win(p, 0.24, 0.7)) * Math.PI * 2;
          const rad = Math.min(w, h) * 0.44;
          cmd = { x: w / 2 + Math.cos(a) * rad * 1.3, y: h / 2 + Math.sin(a) * rad, r: 18, urgency: 0.8 };
        } else if (p >= 0.86) {
          cmd = { x: w / 2, y: h * 0.5, r: mix(24, 34, win(p, 0.86, 1)), urgency: 0.5 };
        } else {
          cmd = home();
        }
      } else {
        // CODA
        if (p > 0.16 && p < 0.5) {
          const t = smooth(win(p, 0.18, 0.42));
          const x0 = w < 768 ? w * 0.06 : w * 0.12;
          cmd = { x: mix(x0, x0 + w * 0.58, t), y: h * 0.46, r: 18, urgency: 0.6 };
        } else {
          cmd = home();
        }
      }

      creature.update(dt, cmd);
      creature.render(ctx);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", readScroll);
    };
  }, []);

  const bind = (i: number) => (el: HTMLDivElement | null) => {
    chapterEls.current[i] = el;
  };

  return (
    <div style={{ height: `${CHAPTERS * SCROLL_PER_CHAPTER * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div ref={stageRef} className="absolute inset-0">
          <HeroChapter chapterRef={bind(0)} />
          <SurfChapter project={projects[0]!} chapterRef={bind(1)} />
          <BurnChapter project={projects[1]!} chapterRef={bind(2)} />
          <ShatterChapter project={projects[2]!} chapterRef={bind(3)} />
          <SweepChapter project={projects[3]!} chapterRef={bind(4)} />
          <ContactChapter chapterRef={bind(5)} />
        </div>
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-50"
          aria-hidden
        />
      </div>
    </div>
  );
}
