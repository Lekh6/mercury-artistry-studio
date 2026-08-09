/**
 * Experimental dark/light inversion. The whole visual system is driven by the
 * `data-theme` attribute on <html>, so every token, canvas layer and the
 * transition read the same single source of truth.
 */
export type Theme = "dark" | "light";

const listeners = new Set<(theme: Theme) => void>();

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset["theme"] === "light" ? "light" : "dark";
}

export function isLight() {
  return getTheme() === "light";
}

export function setTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["theme"] = theme;
  listeners.forEach((fn) => fn(theme));
}

export function toggleTheme() {
  setTheme(getTheme() === "light" ? "dark" : "light");
}

export function onThemeChange(fn: (theme: Theme) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
