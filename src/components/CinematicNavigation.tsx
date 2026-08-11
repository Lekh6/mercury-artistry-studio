import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { getCursor } from "@/lib/cursor-state";
import { ParticleVeil } from "@/components/transition/ParticleVeil";

export type World = "projects" | "resume" | "about";

type Stage = "invert" | "dust" | "rebuild";

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

/** cover the old page from the cursor (the "negative state") */
const EXPAND = 360;
/** the negative surface disintegrates into dust, revealing the new page */
const DUST = 580;
/** the dust settles back into place — matter reassembling */
const REBUILD = 460;

function maxRadius(x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 8;
}

export function CinematicNavigation({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const router = useRouter();
  const veilRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const busy = useRef(false);
  /** Destination is locked the instant the user commits, never read later. */
  const destination = useRef<string>("/");
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);

  const run = useCallback((target: World | null, origin?: Origin) => {
    if (busy.current) return;
    busy.current = true;

    // 1. Lock the destination before a single frame of animation plays.
    const to = target ? PATHS[target] : "/";
    destination.current = to;
    // 2. Warm the destination route so the reconstruct stage has content ready.
    const preloaded = Promise.resolve(router.preloadRoute({ to })).catch(() => undefined);

    const cursor = getCursor();
    const start = { x: origin?.x ?? cursor.x, y: origin?.y ?? cursor.y };
    const seed = origin?.r ?? 8;
    setStage("invert");

    // The solid, opposite-colour veil grows out of the cursor and covers the
    // old page — a clean "negative state" with no blur and no gray.
    requestAnimationFrame(() => {
      const veil = veilRef.current;
      if (!veil) return;
      veil.style.transition = "none";
      veil.style.opacity = "1";
      veil.style.clipPath = `circle(${seed}px at ${start.x}px ${start.y}px)`;
      requestAnimationFrame(() => {
        veil.style.transition = `clip-path ${EXPAND}ms cubic-bezier(0.22, 0.75, 0.16, 1)`;
        veil.style.clipPath = `circle(${maxRadius(start.x, start.y)}px at ${start.x}px ${start.y}px)`;
      });
    });

    const push = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    // Once the old page is fully covered, swap the route behind the veil (so no
    // wrong page can flash), then hand the visuals to the particle field: the
    // negative surface breaks into dust and clears to reveal the new page,
    // then a settling wave reassembles that same matter into place.
    push(() => {
      void (async () => {
        await preloaded;
        await navigate({ to: destination.current });
        window.scrollTo(0, 0);

        setStage("dust");
        const veil = veilRef.current;
        if (veil) {
          veil.style.transition = `opacity ${DUST}ms cubic-bezier(0.7, 0, 0.84, 0.35)`;
          veil.style.opacity = "0";
        }

        push(() => {
          setStage("rebuild");
          push(() => {
            setStage(null);
            busy.current = false;
          }, REBUILD);
        }, DUST);
      })();
    }, EXPAND);
  }, [navigate, router]);

  return (
    <TransitionContext.Provider value={{
      travel: (target, origin) => run(target, origin),
      returnHome: (origin) => run(null, origin),
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
            stage={stage === "dust" ? "dust" : stage === "rebuild" ? "rebuild" : null}
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
