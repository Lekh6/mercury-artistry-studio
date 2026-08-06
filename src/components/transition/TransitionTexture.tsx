import { useMemo } from "react";
import type { World } from "@/components/CinematicNavigation";

/** Subtle, near-black animated textures shown while the screen is masked. */
export function TransitionTexture({ world, collapsing, origin }: {
  world: World;
  collapsing: boolean;
  origin: { x: number; y: number };
}) {
  const style = collapsing
    ? {
        transform: `translate(${origin.x - (typeof window === "undefined" ? 0 : window.innerWidth / 2)}px, ${origin.y - (typeof window === "undefined" ? 0 : window.innerHeight / 2)}px) scale(0.02)`,
        opacity: 0,
      }
    : undefined;

  return (
    <div className={`tex tex--${world}`} style={style} aria-hidden>
      {world === "projects" ? <BinaryTexture /> : null}
      {world === "resume" ? <SymbolTexture /> : null}
      {world === "about" ? <IconTexture /> : null}
    </div>
  );
}

function BinaryTexture() {
  const rows = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        text: Array.from({ length: 90 }, () => (Math.random() > 0.5 ? "1" : "0")).join(" "),
        duration: 9 + Math.random() * 9,
        delay: -Math.random() * 10,
        reverse: index % 3 === 1,
      })),
    [],
  );
  return (
    <div className="tex-rows">
      {rows.map((row, index) => (
        <span
          key={index}
          className={`tex-row ${row.reverse ? "tex-row--rev" : ""}`}
          style={{ animationDuration: `${row.duration}s`, animationDelay: `${row.delay}s` }}
        >
          {row.text}
        </span>
      ))}
    </div>
  );
}

function SymbolTexture() {
  const items = useMemo(() => scatter(16), []);
  return (
    <div className="tex-float">
      {items.map((item, index) => (
        <svg key={index} viewBox="0 0 48 48" style={item.style} className="tex-mark">
          {index % 3 === 0 ? (
            <>
              <rect x="10" y="6" width="28" height="36" rx="1" />
              <path d="M16 16h16M16 23h16M16 30h10" />
            </>
          ) : index % 3 === 1 ? (
            <>
              <circle cx="24" cy="24" r="16" />
              <path d="M8 24h32M24 8c8 8 8 24 0 32M24 8c-8 8-8 24 0 32" />
            </>
          ) : (
            <>
              <rect x="6" y="10" width="36" height="28" rx="2" />
              <path d="M6 18h36M12 14h2M17 14h2" />
            </>
          )}
        </svg>
      ))}
    </div>
  );
}

function IconTexture() {
  const items = useMemo(() => scatter(14), []);
  const icons = [
    // headphones
    <><path d="M10 28v-4a14 14 0 0 1 28 0v4" /><rect x="6" y="27" width="8" height="12" rx="3" /><rect x="34" y="27" width="8" height="12" rx="3" /></>,
    // controller
    <><rect x="6" y="16" width="36" height="18" rx="9" /><path d="M15 21v8M11 25h8M31 24h.01M35 28h.01" /></>,
    // sports car
    <><path d="M6 30h36l-4-8-6-4H18l-7 6-5 2z" /><circle cx="16" cy="32" r="4" /><circle cx="34" cy="32" r="4" /></>,
    // dumbbell
    <><path d="M8 18v12M14 15v18M34 15v18M40 18v12M14 24h20" /></>,
    // keyboard
    <><rect x="5" y="15" width="38" height="18" rx="2" /><path d="M11 21h2M17 21h2M23 21h2M29 21h2M35 21h2M15 27h18" /></>,
    // music
    <><path d="M20 32V13l16-3v19" /><circle cx="16" cy="33" r="4" /><circle cx="32" cy="30" r="4" /></>,
  ];
  return (
    <div className="tex-float">
      {items.map((item, index) => (
        <svg key={index} viewBox="0 0 48 48" style={item.style} className="tex-mark">
          {icons[index % icons.length]}
        </svg>
      ))}
    </div>
  );
}

function scatter(count: number) {
  return Array.from({ length: count }, () => ({
    style: {
      left: `${Math.random() * 92}%`,
      top: `${Math.random() * 88}%`,
      width: `${34 + Math.random() * 46}px`,
      animationDuration: `${11 + Math.random() * 12}s`,
      animationDelay: `${-Math.random() * 12}s`,
    } as const,
  }));
}
