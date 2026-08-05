import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export type World = "projects" | "resume" | "about";

type TransitionContextValue = {
  travel: (world: World) => void;
  returnHome: () => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const pattern: Record<World, string> = {
  projects: "0 1 0 1 1 0 1 0",
  resume: "WWW · WWW · WWW",
  about: "⚔ ◉ ⚔ ◉ ⚔ ◉",
};

export function CinematicNavigation({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [active, setActive] = useState<World | null>(null);
  const [reverse, setReverse] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const run = useCallback((world: World, home: boolean) => {
    if (timer.current !== null) return;
    setReverse(home);
    setActive(world);
    timer.current = window.setTimeout(async () => {
      if (home) await navigate({ to: "/" });
      else if (world === "projects") await navigate({ to: "/projects" });
      else if (world === "resume") await navigate({ to: "/resume" });
      else await navigate({ to: "/about" });
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        setActive(null);
        setReverse(false);
        timer.current = null;
      }, 480);
    }, 1050);
  }, [navigate]);

  const worldFromPath = (): World => {
    const value = window.location.pathname.slice(1);
    return value === "resume" || value === "about" ? value : "projects";
  };

  return (
    <TransitionContext.Provider value={{
      travel: (world) => run(world, false),
      returnHome: () => run(worldFromPath(), true),
    }}>
      {children}
      {active ? (
        <div className={`camera-transition camera-transition--${active} ${reverse ? "is-reverse" : ""}`} aria-hidden>
          <div className="camera-transition__distance" />
          <div className="camera-transition__crystal">
            <div className="crystal-engraving">{pattern[active]}<br />{pattern[active]}<br />{pattern[active]}</div>
          </div>
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
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <Button
        type="button"
        variant="ghost"
        onClick={returnHome}
        className="h-14 w-full justify-start rounded-none px-6 text-[0.65rem] font-normal uppercase tracking-[0.28em] text-muted-foreground hover:bg-secondary hover:text-foreground md:h-16 md:px-10"
      >
        <span aria-hidden>↑</span> Return
      </Button>
    </header>
  );
}