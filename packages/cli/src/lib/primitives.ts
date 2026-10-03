/** Where shadcn/ui components import their primitives from. */
export type Library = 'radix-ui' | 'base-ui' | 'react-aria';

export type Primitive = {
  library: Library;
  /** Subpath under `@animate-ui/react/primitives/<library>/`. */
  name: string;
  /**
   * Classes the shadcn component uses to animate this primitive in CSS. They
   * would fight Motion, so `animate` removes them (on top of the tw-animate
   * utilities every primitive drops).
   */
  strip?: RegExp[];
};

/** Primitives Animate UI animates. Grows as primitives ship. */
export const PRIMITIVES: Primitive[] = [
  { library: 'radix-ui', name: 'accordion' },
];

export const PACKAGE = '@animate-ui/react';

export function primitiveModule(primitive: Primitive) {
  return `${PACKAGE}/primitives/${primitive.library}/${primitive.name}`;
}

export function findPrimitive(library: Library, name: string) {
  return PRIMITIVES.find((p) => p.library === library && p.name === name);
}

/** `AlertDialog` → `alert-dialog`. */
export function toKebab(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
