/**
 * Shared, read-only-ish state describing an active dimensional aperture.
 * The navigation writes it; the landing geometry reads it. Neither touches
 * the other's DOM.
 */
export const shearState = {
  /** aperture origin, viewport coordinates */
  x: 0,
  y: 0,
  /** 0..1 strength of the pull toward the aperture */
  pull: 0,
};

export function setShearPull(x: number, y: number, pull: number) {
  shearState.x = x;
  shearState.y = y;
  shearState.pull = pull;
}

export function clearShearPull() {
  shearState.pull = 0;
}
