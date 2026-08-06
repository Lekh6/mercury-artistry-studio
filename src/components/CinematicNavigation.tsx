import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getCursor } from "@/lib/cursor-state";
import { TransitionTexture } from "@/components/transition/TransitionTexture";

export type World = "projects" | "resume" | "about";

type Phase = "expand" | "hold" | "collapse";

type TransitionContextValue = {
  travel: (world: World) => void;
  returnHome: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const EXPAND = 620;
const PAUSE = 200;
const TEXTURE = 700;
const COLLAPSE = 700;

function maxRadius(x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 8;
}

export function CinematicNavigation({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const maskRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const busy = useRef(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [world, setWorld] = useState<World>("projects");
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);

  const run = useCallback((target: World, home: boolean) => {
    if (busy.current) return;
    busy.current = true;

    const start = getCursor();
    setWorld(target);
    setOrigin(start);
    setPhase("expand");

    requestAnimationFrame(() => {
      const mask = maskRef.current;
      if (!mask) return;
      mask.style.transition = "none";
      mask.style.clipPath = `circle(6px at ${start.x}px ${start.y}px)`;
      requestAnimationFrame(() => {
        mask.style.transition = `clip-path ${EXPAND}ms cubic-bezier(0.65, 0, 0.2, 1)`;
        mask.style.clipPath = `circle(${maxRadius(start.x, start.y)}px at ${start.x}px ${start.y}px)`;
      });
    });

    const push = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    push(() => {
      setPhase("hold");
      const to = home ? "/" : `/${target}` as const;
      void navigate({ to });
      window.scrollTo(0, 0);
    }, EXPAND);

    push(() => {
      const end = getCursor();
      setOrigin(end);
      setPhase("collapse");
      const mask = maskRef.current;
      if (mask) {
        mask.style.transition = "none";
        mask.style.clipPath = `circle(${maxRadius(end.x, end.y)}px at ${end.x}px ${end.y}px)`;
        requestAnimationFrame(() => {
          mask.style.transition = `clip-path ${COLLAPSE}ms cubic-bezier(0.7, 0, 0.25, 1)`;
          mask.style.clipPath = `circle(0px at ${end.x}px ${end.y}px)`;
        });
      }
    }, EXPAND + PAUSE + TEXTURE);

    push(() => {
      setPhase(null);
      busy.current = false;
    }, EXPAND + PAUSE + TEXTURE + COLLAPSE);
  }, [navigate]);

  const worldFromPath = (): World => {
    const value = window.location.pathname.slice(1);
    return value === "resume" || value === "about" ? value : "projects";
  };

  return (
    <TransitionContext.Provider value={{
      travel: (target) => run(target, false),
      returnHome: () => run(worldFromPath(), true),
    }}>
      {children}
      {phase ? (
        <div className="page-mask" ref={maskRef} aria-hidden>
          {phase !== "expand" ? (
            <TransitionTexture world={world} collapsing={phase === "collapse"} origin={origin} />
          ) : null}
        </div>
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
      <button type="button" onClick={returnHome} className="return-bar__button">
        <span aria-hidden>↑</span> Return
      </button>
    </header>
  );
}
