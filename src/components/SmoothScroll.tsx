import { useEffect } from "react";

/** Cinematic inertial scrolling. Loaded client-side only. */
export function SmoothScroll() {
  useEffect(() => {
    let destroy = () => {};
    let raf = 0;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.5,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
      });
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      destroy = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      destroy();
    };
  }, []);

  return null;
}
