import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;
    let x = -20;
    let y = -20;
    let tx = x;
    let ty = y;
    let raf = 0;

    const move = (event: MouseEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      cursor.dataset["visible"] = "true";
    };
    const down = () => { cursor.dataset["pressed"] = "true"; };
    const up = () => { cursor.dataset["pressed"] = "false"; };
    const leave = () => { cursor.dataset["visible"] = "false"; };
    const frame = () => {
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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

  return <div ref={cursorRef} className="custom-cursor" aria-hidden />;
}