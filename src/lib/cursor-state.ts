/** Global pointer position, shared by the cursor and the page transition. */
export const cursorState = { x: 0, y: 0, has: false };

export function setCursor(x: number, y: number) {
  cursorState.x = x;
  cursorState.y = y;
  cursorState.has = true;
}

/** Falls back to the viewport centre for keyboard / touch activation. */
export function getCursor() {
  if (cursorState.has) return { x: cursorState.x, y: cursorState.y };
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}
