import type { ComponentType } from "react";
import type { RevealProps, RevealName } from "./types";
import { WipeReveal } from "@/components/reveals/WipeReveal";
import { DragSelectReveal } from "@/components/reveals/DragSelectReveal";

/**
 * Registry of reveal behaviours. Add a new choreography by writing a
 * component that accepts RevealProps and registering it here — pages refer
 * to reveals by name only, so nothing else has to change.
 */
export const reveals: Record<RevealName, ComponentType<RevealProps>> = {
  wipe: WipeReveal,
  "drag-select": DragSelectReveal,
};

export function Reveal({ as, ...props }: RevealProps & { as: RevealName }) {
  const Component = reveals[as];
  return <Component {...props} />;
}
