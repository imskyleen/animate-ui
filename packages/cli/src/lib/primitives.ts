import { PRIMITIVES as ALL } from '../primitives';

/**
 * Where shadcn/ui components import their primitives from. `animate-ui`:
 * packages Animate UI replaces with its own drop-in (`input-otp`).
 */
export type Library = 'radix-ui' | 'base-ui' | 'react-aria' | 'animate-ui';

export type Primitive = {
  library: Library;
  /**
   * Subpath under `@animate-ui/react/primitives/<library>/`, or directly
   * under `primitives/` for Animate UI's own (`animate-ui`).
   */
  name: string;
  /**
   * Classes the shadcn component uses to animate this primitive in CSS. They
   * would fight Motion, so `animate` removes them (on top of the tw-animate
   * utilities every primitive drops).
   */
  strip?: RegExp[];
  /**
   * React Aria only: the `react-aria-components` exports this primitive
   * animates. A file importing any of them switches to Animate UI's mirror.
   */
  exports?: string[];
};

/** Primitives Animate UI animates: one file each in src/primitives. */
export const PRIMITIVES: Primitive[] = ALL;

export const PACKAGE = '@animate-ui/react';

export function primitiveModule(primitive: Primitive) {
  // React Aria has one package: its mirror has one entry too.
  if (primitive.library === 'react-aria')
    return `${PACKAGE}/primitives/react-aria`;
  // Animate UI's own primitives have no library folder.
  if (primitive.library === 'animate-ui')
    return `${PACKAGE}/primitives/${primitive.name}`;
  return `${PACKAGE}/primitives/${primitive.library}/${primitive.name}`;
}

/**
 * The mirror of a library's umbrella package (`radix-ui`, `@base-ui/react`):
 * everything it exports, with Animate UI's animated primitives.
 */
export function barrelModule(library: 'radix-ui' | 'base-ui' | 'react-aria') {
  return `${PACKAGE}/primitives/${library}`;
}

/** The React Aria primitive that animates `exportName`, if any. */
export function findReactAriaPrimitive(exportName: string) {
  return PRIMITIVES.find(
    (p) => p.library === 'react-aria' && p.exports?.includes(exportName),
  );
}

export function findPrimitive(library: Library, name: string) {
  return PRIMITIVES.find((p) => p.library === library && p.name === name);
}

/** `AlertDialog` → `alert-dialog`. */
export function toKebab(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
