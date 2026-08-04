/** progress window helper: a unitless 0..1 CSS expression over --p */
export const q = (a: number, b: number) =>
  `clamp(0, (var(--p) - ${a}) / ${b - a}, 1)`;

/** eased (smoothstep-ish) window */
export const qe = (a: number, b: number) => {
  const t = q(a, b);
  return `calc(${t} * ${t} * (3 - 2 * ${t}))`;
};

export const pct = (expr: string) => `calc((${expr}) * 100%)`;
