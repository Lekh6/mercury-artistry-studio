import { useEffect, useRef } from "react";
import { setCursor } from "@/lib/cursor-state";
import { toggleTheme } from "@/lib/theme";

/** Continuous hold needed before the world inverts. */
const CHARGE_MS = 5600;

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let pressStart = 0;
    let charging = false;
    let flooding = false;
    let floodTimer = 0;

    const resetCharge = () => {
      charging = false;
      pressStart = 0;
      cursor.dataset["charging"] = "false";
      cursor.style.setProperty("--charge", "0");
    };

    const move = (event: MouseEvent) => {
      // clientX/clientY are viewport coordinates: scrolling must never move us.
      tx = event.clientX;
      ty = event.clientY;
      setCursor(tx, ty);
      cursor.dataset["visible"] = "true";
    };
    const down = () => {
      cursor.dataset["pressed"] = "true";
      pressStart = performance.now();
      charging = true;
    };
    const up = () => {
      cursor.dataset["pressed"] = "false";
      resetCharge();
    };
    const leave = () => { cursor.dataset["visible"] = "false"; };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      x += (tx - x) * 0.35;
      y += (ty - y) * 0.35;

      let shakeX = 0;
      let shakeY = 0;
      if (charging && !flooding) {
        const t = Math.min(1, (performance.now() - pressStart) / CHARGE_MS);
        // Nothing perceptible for the first third: a normal click stays a click.
        const energy = Math.max(0, (t - 0.32) / 0.68);
        cursor.style.setProperty("--charge", energy.toFixed(3));
        if (energy > 0) {
          const amp = energy * energy * 7;
          const now = performance.now();
          shakeX = Math.sin(now / 26) * amp;
          shakeY = Math.cos(now / 19) * amp;
        }
        if (t >= 1) {
          charging = false;
          flooding = true;
          cursor.dataset["charging"] = "false";
          cursor.dataset["flooding"] = "true";
          floodTimer = window.setTimeout(() => {
            toggleTheme();
            floodTimer = window.setTimeout(() => {
              cursor.dataset["flooding"] = "false";
              flooding = false;
              cursor.style.setProperty("--charge", "0");
            }, 260);
          }, 460);
        } else {
          cursor.dataset["charging"] = energy > 0 ? "true" : "false";
        }
      }

      cursor.style.transform = `translate3d(${x + shakeX}px, ${y + shakeY}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("blur", up);
    document.documentElement.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(floodTimer);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("blur", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden>
      <span className="custom-cursor__dot" />
    </div>
  );
}
