import { PRIMITIVES as ALL } from '../primitives';

export type Library = 'radix-ui' | 'base-ui' | 'react-aria' | 'animate-ui';

export type Primitive = {
  library: Library;
  name: string;
  strip?: RegExp[];
  exports?: string[];
};

export const PRIMITIVES: Primitive[] = ALL;

export const PACKAGE = '@animate-ui/react';

export function primitiveModule(primitive: Primitive) {
  if (primitive.library === 'react-aria')
    return `${PACKAGE}/primitives/react-aria`;
  if (primitive.library === 'animate-ui')
    return `${PACKAGE}/primitives/${primitive.name}`;
  return `${PACKAGE}/primitives/${primitive.library}/${primitive.name}`;
}

export function barrelModule(library: 'radix-ui' | 'base-ui' | 'react-aria') {
  return `${PACKAGE}/primitives/${library}`;
}

export function findReactAriaPrimitive(exportName: string) {
  return PRIMITIVES.find(
    (p) => p.library === 'react-aria' && p.exports?.includes(exportName),
  );
}

export function findPrimitive(library: Library, name: string) {
  return PRIMITIVES.find((p) => p.library === library && p.name === name);
}

export function toKebab(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
