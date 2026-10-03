import type * as React from 'react';

// Helpers shared by the text primitives. Not a public entry point (no
// index.tsx): the package's subpaths only map folders with an index.

/**
 * Hides the screen reader copy of an animated text without relying on a CSS
 * framework. The `sr-only` class is kept next to it as a styling hook.
 */
const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

let segmenter: Intl.Segmenter | null | undefined;

/** Splits into user-perceived characters so emoji and accents stay whole. */
function splitGraphemes(text: string): string[] {
  if (segmenter === undefined) {
    segmenter =
      typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null;
  }
  if (!segmenter) return Array.from(text);
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

export { VISUALLY_HIDDEN, splitGraphemes };
