// Sidebar sections of Animate UI's own primitives, by docs slug. Navigation
// only: imports stay `@animate-ui/react/primitives/<name>` (or
// `primitives/texts/…`, `buttons/…`, `effects/…`). Primitives with a Radix UI,
// Base UI or React Aria page (Tabs and Tooltip included) go under Components.
export type PrimitiveSection =
  'components' | 'animate-ui' | 'buttons' | 'texts' | 'effects';

// Anything else with only an Animate UI page goes under Animate UI.
const SECTIONS: Record<string, 'buttons' | 'texts' | 'effects'> = {
  button: 'buttons',
  'flip-button': 'buttons',
  'liquid-button': 'buttons',
  'ripple-button': 'buttons',

  'counting-number': 'texts',
  'gradient-text': 'texts',
  'highlight-text': 'texts',
  'morphing-text': 'texts',
  'rolling-text': 'texts',
  'rotating-text': 'texts',
  'scrolling-number': 'texts',
  'shimmering-text': 'texts',
  'sliding-number': 'texts',
  'splitting-text': 'texts',
  'typing-text': 'texts',

  'auto-height': 'effects',
  blur: 'effects',
  click: 'effects',
  effect: 'effects',
  fade: 'effects',
  highlight: 'effects',
  'image-zoom': 'effects',
  magnetic: 'effects',
  particles: 'effects',
  shine: 'effects',
  slide: 'effects',
  'theme-toggler': 'effects',
  tilt: 'effects',
  zoom: 'effects',
};

/** `onlyAnimateUI`: the primitive has no Radix UI, Base UI or React Aria page. */
export function primitiveSection(
  slug: string,
  onlyAnimateUI: boolean,
): PrimitiveSection {
  if (!onlyAnimateUI) return 'components';
  return SECTIONS[slug] ?? 'animate-ui';
}
