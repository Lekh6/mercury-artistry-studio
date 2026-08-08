import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getCursor } from "@/lib/cursor-state";
import { ParticleVeil } from "@/components/transition/ParticleVeil";

export type World = "projects" | "resume" | "about";

type Stage = "invert" | "freeze" | "dust" | "rebuild" | "collapse";

type TransitionContextValue = {
  travel: (world: World) => void;
  returnHome: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const EXPAND = 340;
const FREEZE = 140;
const DUST = 320;
const REBUILD = 520;
const COLLAPSE = 520;

function maxRadius(x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 8;
}

export function CinematicNavigation({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const veilRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const busy = useRef(false);
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);

  const run = useCallback((target: World | null) => {
    if (busy.current) return;
    busy.current = true;

    const start = getCursor();
    setStage("invert");

    requestAnimationFrame(() => {
      const veil = veilRef.current;
      if (!veil) return;
      veil.style.transition = "none";
      veil.style.clipPath = `circle(7px at ${start.x}px ${start.y}px)`;
      requestAnimationFrame(() => {
        veil.style.transition = `clip-path ${EXPAND}ms cubic-bezier(0.16, 0.9, 0.2, 1)`;
        veil.style.clipPath = `circle(${maxRadius(start.x, start.y)}px at ${start.x}px ${start.y}px)`;
      });
    });

    const push = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    push(() => setStage("freeze"), EXPAND);
    push(() => setStage("dust"), EXPAND + FREEZE);

    push(() => {
      setStage("rebuild");
      if (!target) void navigate({ to: "/" });
      else if (target === "projects") void navigate({ to: "/projects" });
      else if (target === "resume") void navigate({ to: "/resume" });
      else void navigate({ to: "/about" });
      window.scrollTo(0, 0);
    }, EXPAND + FREEZE + DUST);

    push(() => {
      setStage("collapse");
      const end = getCursor();
      const veil = veilRef.current;
      if (veil) {
        veil.style.transition = "none";
        veil.style.clipPath = `circle(${maxRadius(end.x, end.y)}px at ${end.x}px ${end.y}px)`;
        requestAnimationFrame(() => {
          veil.style.transition = `clip-path ${COLLAPSE}ms cubic-bezier(0.7, 0, 0.2, 1)`;
          veil.style.clipPath = `circle(0px at ${end.x}px ${end.y}px)`;
        });
      }
    }, EXPAND + FREEZE + DUST + REBUILD);

    push(() => {
      setStage(null);
      busy.current = false;
    }, EXPAND + FREEZE + DUST + REBUILD + COLLAPSE);
  }, [navigate]);

  return (
    <TransitionContext.Provider value={{
      travel: (target) => run(target),
      returnHome: () => run(null),
    }}>
      <div className="reality">
        <div className="reality__page" data-stage={stage ?? "idle"}>
          {children}
        </div>
      </div>
      {stage ? (
        <>
          <div className="invert-veil" ref={veilRef} aria-hidden />
          <ParticleVeil
            stage={stage === "dust" ? "dust" : stage === "rebuild" || stage === "collapse" ? "rebuild" : null}
            duration={stage === "dust" ? DUST : REBUILD}
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
      <button type="button" onClick={returnHome} className="return-bar__button">
        <span aria-hidden>↑</span> Return
      </button>
    </header>
  );
}
