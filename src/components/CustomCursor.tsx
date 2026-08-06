import { useEffect, useRef } from "react";
import { setCursor } from "@/lib/cursor-state";

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

    const move = (event: MouseEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      setCursor(tx, ty);
      cursor.dataset["visible"] = "true";
    };
    const down = () => { cursor.dataset["pressed"] = "true"; };
    const up = () => { cursor.dataset["pressed"] = "false"; };
    const leave = () => { cursor.dataset["visible"] = "false"; };
    const frame = () => {
      x += (tx - x) * 0.35;
      y += (ty - y) * 0.35;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden>
      <span className="custom-cursor__dot" />
    </div>
  );
}
