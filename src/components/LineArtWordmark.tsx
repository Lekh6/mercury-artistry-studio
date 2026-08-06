import { useEffect, useId, useMemo, useState } from "react";

type Fragment = { cx: number; cy: number; r: number; delay: number };

/**
 * The name as pure line art: outline-only glyphs revealed by fragments that
 * pop in in a different random order on every load, then a travelling current
 * and one single glow.
 */
export function LineArtWordmark({ instant }: { instant: boolean }) {
  const id = `frag${useId().replace(/[:»]/g, "")}`;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fragments = useMemo<Fragment[]>(() => {
    if (!mounted) return [];
    const cols = 7;
    const rows = 4;
    const cells: Fragment[] = [];
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        cells.push({
          cx: 40 + (cx + 0.5) * (560 / cols) + (Math.random() - 0.5) * 40,
          cy: 20 + (cy + 0.5) * (270 / rows) + (Math.random() - 0.5) * 30,
          r: 58 + Math.random() * 26,
          delay: 0,
        });
      }
    }
    // Random discovery order, re-shuffled on every mount.
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = cells[i]!;
      cells[i] = cells[j]!;
      cells[j] = a;
    }
    return cells.map((cell, index) => ({
      ...cell,
      delay: (index / cells.length) * 1.05 + Math.random() * 0.12,
    }));
  }, [mounted]);

  return (
    <svg
      className={`line-art ${instant ? "is-instant" : ""}`}
      viewBox="0 0 640 300"
      role="img"
      aria-label="Lekha Ruthwik"
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse">
          {fragments.map((fragment, index) => (
            <circle
              key={index}
              className="line-art__frag"
              cx={fragment.cx}
              cy={fragment.cy}
              r={fragment.r}
              fill="#fff"
              style={{ animationDelay: `${fragment.delay}s` }}
            />
          ))}
        </mask>
        <linearGradient id={`${id}-current`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.35" stopColor="#fff" />
          <stop offset="0.65" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`${id}-sweep`} maskUnits="userSpaceOnUse">
          <rect
            className="line-art__sweep"
            x="-260"
            y="0"
            width="240"
            height="300"
            fill={`url(#${id}-current)`}
          />
        </mask>
      </defs>

      <g mask={`url(#${id})`} className="line-art__outline">
        <Glyphs />
      </g>
      <g mask={`url(#${id}-sweep)`} className="line-art__current">
        <Glyphs bright />
      </g>
    </svg>
  );
}

function Glyphs({ bright = false }: { bright?: boolean }) {
  const common = {
    textAnchor: "middle" as const,
    fontSize: 128,
    fontWeight: 500,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: bright ? 2.2 : 1.4,
    strokeLinejoin: "round" as const,
  };
  return (
    <>
      <text x="320" y="120" {...common}>Lekha</text>
      <text x="320" y="252" {...common}>Ruthwik</text>
    </>
  );
}
