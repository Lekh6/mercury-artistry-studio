import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { getCursor } from "@/lib/cursor-state";
import { clearShearPull, setShearPull } from "@/lib/shear-state";
import { ShardField } from "@/components/transition/ShardField";

export type World = "projects" | "resume" | "about";

type Stage = "pull" | "shatter" | "freeze" | "reform";

type Origin = { x: number; y: number; r?: number };

type TransitionContextValue = {
  travel: (world: World, origin?: Origin) => void;
  returnHome: (origin?: Origin) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const PATHS = {
  projects: "/projects",
  resume: "/resume",
  about: "/about",
} as const;

const PULL = 420;
const SHATTER = 420;
const FREEZE = 120;
const REFORM = 560;

function maxRadius(x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 8;
}

export function CinematicNavigation({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const router = useRouter();
  const apertureRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const pullRaf = useRef(0);
  const busy = useRef(false);
  /** Destination is locked the instant the user commits, never read later. */
  const destination = useRef<string>("/");
  const [stage, setStage] = useState<Stage | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const cleanup = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    cancelAnimationFrame(pullRaf.current);
    clearShearPull();
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const run = useCallback((target: World | null, seedOrigin?: Origin) => {
    if (busy.current) return;
    busy.current = true;

    // 1. Lock the destination before a single frame of animation plays.
    const to = target ? PATHS[target] : "/";
    destination.current = to;
    // 2. Warm the destination route so reconstruction has real content ready.
    const preloaded = Promise.resolve(router.preloadRoute({ to })).catch(() => undefined);

    // Any in-flight long-press charge is incompatible with a navigation.
    window.dispatchEvent(new CustomEvent("lekha:cancel-charge"));

    const cursor = getCursor();
    const start = { x: seedOrigin?.x ?? cursor.x, y: seedOrigin?.y ?? cursor.y };
    const seed = seedOrigin?.r ?? 8;
    setOrigin(start);

    const page = pageRef.current;
    if (page) {
      page.style.setProperty("--ox", `${start.x}px`);
      page.style.setProperty("--oy", `${start.y}px`);
    }
    setStage("pull");

    // The landing geometry bends toward the same point, using the same field.
    const pullStart = performance.now();
    const drivePull = () => {
      const t = Math.min(1, (performance.now() - pullStart) / (PULL + SHATTER));
      setShearPull(start.x, start.y, t);
      if (t < 1) pullRaf.current = requestAnimationFrame(drivePull);
    };
    pullRaf.current = requestAnimationFrame(drivePull);

    requestAnimationFrame(() => {
      const aperture = apertureRef.current;
      if (!aperture) return;
      aperture.style.transition = "none";
      aperture.style.clipPath = `circle(${seed}px at ${start.x}px ${start.y}px)`;
      requestAnimationFrame(() => {
        aperture.style.transition = `clip-path ${PULL + SHATTER}ms cubic-bezier(0.5, 0, 0.2, 1)`;
        aperture.style.clipPath = `circle(${maxRadius(start.x, start.y)}px at ${start.x}px ${start.y}px)`;
      });
    });

    const push = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    push(() => setStage("shatter"), PULL);

    // 3. Mount the destination only once the field is opaque, and resume only
    //    once the router has actually committed it.
    push(() => {
      void (async () => {
        setStage("freeze");
        await preloaded;
        await navigate({ to: destination.current });
        window.scrollTo(0, 0);
        clearShearPull();
        // Reconstruction pulls back to wherever the pointer is right now.
        setOrigin(getCursor());
        requestAnimationFrame(() => {
          const aperture = apertureRef.current;
          if (aperture) {
            aperture.style.transition = "none";
            aperture.style.clipPath = "circle(0px at 50% 50%)";
          }
          setStage("reform");
          push(() => {
            setStage(null);
            busy.current = false;
          }, REFORM);
        });
      })();
    }, PULL + SHATTER);
  }, [navigate, router]);

  return (
    <TransitionContext.Provider value={{
      travel: (target, o) => run(target, o),
      returnHome: (o) => run(null, o),
    }}>
      <div className="reality">
        <div className="reality__page" ref={pageRef} data-stage={stage ?? "idle"}>
          {children}
        </div>
      </div>
      {stage ? (
        <>
          <div
            className="aperture"
            ref={apertureRef}
            data-stage={stage}
            aria-hidden
          />
          <ShardField
            phase={stage === "pull" || stage === "shatter" ? "shatter" : stage === "reform" ? "reform" : "shatter"}
            origin={origin}
            duration={stage === "reform" ? REFORM : PULL + SHATTER}
          />
        </>
      ) : null}
    </TransitionContext.Provider>
  );
}

export function useCinematicNavigation() {
  const value = useContext(TransitionContext);
  if (!value) throw new Error("useCinematicNavigation must be used within CinematicNavigation");
  return value;
}

export function ReturnBar() {
  const { returnHome } = useCinematicNavigation();
  return (
    <header className="return-bar">
      <button
        type="button"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          returnHome({ x: rect.left + 28, y: rect.top + rect.height / 2, r: 14 });
        }}
        className="return-bar__button"
      >
        <span aria-hidden>↑</span> Return
      </button>
    </header>
  );
}
