import { useEffect, useState } from "react";

const LINES = ["Lekha", "Ruthwik"];

/**
 * The name is plain white type. It is first concealed under a white selection
 * region that retracts off the glyphs (reverse text-selection), after which
 * every character becomes independently hover-invertible.
 */
export function NameReveal({ instant }: { instant: boolean }) {
  const [revealed, setRevealed] = useState(instant);

  useEffect(() => {
    if (instant) { setRevealed(true); return; }
    const id = window.setTimeout(() => setRevealed(true), 1150);
    return () => window.clearTimeout(id);
  }, [instant]);

  return (
    <h1
      className={`name-mark ${instant ? "is-instant" : ""} ${revealed ? "is-live" : ""}`}
      aria-label="Lekha Ruthwik"
    >
      {LINES.map((line, lineIndex) => (
        <span className="name-line" key={line}>
          <span className="name-line__glyphs" aria-hidden>
            {line.split("").map((character, index) => (
              <span className="name-glyph" key={`${line}-${index}`}>
                {character}
              </span>
            ))}
          </span>
          <span
            className="name-selection"
            aria-hidden
            style={{ animationDelay: `${180 + lineIndex * 170}ms` }}
          />
        </span>
      ))}
    </h1>
  );
}
