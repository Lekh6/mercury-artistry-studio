/**
 * The white entity — a single global blob shared by the whole page.
 *
 * Any part of the UI can "claim" the entity by pushing a target onto the
 * claim stack. The topmost claim wins. Releasing a claim hands the entity
 * back to whoever claimed it before (ultimately the ambient idle target).
 *
 * This is deliberately framework-free so reveal animations, scroll
 * choreography and future behaviours can all drive the same creature
 * without prop drilling or re-renders.
 */

export type BlobTarget = {
  /** viewport coordinates of the entity centre */
  x: number;
  y: number;
  /** base radius in px */
  size?: number;
  /** 0 = lazy drift, 1 = urgent snap */
  urgency?: number;
  /** entity hides itself (e.g. while it is "being" a rectangle) */
  hidden?: boolean;
};

type Claim = { id: string; target: BlobTarget };

const stack: Claim[] = [];
let idle: BlobTarget = { x: 0, y: 0, size: 26, urgency: 0.25 };
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export function setIdleTarget(t: BlobTarget) {
  idle = { size: 26, urgency: 0.25, ...t };
  notify();
}

export function claimBlob(id: string, target: BlobTarget) {
  const existing = stack.find((c) => c.id === id);
  if (existing) existing.target = target;
  else stack.push({ id, target });
  notify();
}

export function releaseBlob(id: string) {
  const i = stack.findIndex((c) => c.id === id);
  if (i !== -1) stack.splice(i, 1);
  notify();
}

export function activeTarget(): BlobTarget {
  const top = stack[stack.length - 1];
  return { size: 26, urgency: 0.25, hidden: false, ...(top ? top.target : idle) };
}

export function subscribeBlob(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
