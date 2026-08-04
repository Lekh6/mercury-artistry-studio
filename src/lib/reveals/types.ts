import type { ReactNode } from "react";

/**
 * A reveal is a choreography performed BY the white entity that causes
 * content to exist. Every reveal receives the same contract, so new
 * behaviours can be registered without touching the pages that use them.
 */
export type RevealProps = {
  children: ReactNode;
  /** ties the entity claim to this instance */
  id: string;
  /** delay in ms after the element enters the viewport */
  delay?: number;
  /** where the entity should rest once the reveal is finished */
  restSide?: "left" | "right";
  className?: string;
};

export type RevealName = "wipe" | "drag-select";
