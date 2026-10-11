// Sidebar sections of the primitives, by docs slug. Navigation only: imports
// stay `@animate-ui/react/primitives/<name>` (or `primitives/texts/…`,
// `buttons/…`, `effects/…`). Every shadcn/ui component goes under Components:
// those with a Radix UI, Base UI or React Aria page (Tabs and Tooltip
// included), and those built on another package Animate UI replaces (Input
// OTP). Animate UI's own primitives go under Animate UI, or their kind.
export type PrimitiveSection =
  'components' | 'animate-ui' | 'buttons' | 'texts' | 'effects';

/**
 * shadcn/ui components with only an Animate UI page: Animate UI's drop-in
 * stands in for the package they're built on (the CLI's `animate-ui`
 * primitives).
 */
const SHADCN_COMPONENTS = new Set(['input-otp']);

// Anything else with only an Animate UI page goes under Animate UI.
const SECTIONS: Record<string, 'buttons' | 'texts' | 'effects'> = {
  button: 'buttons',
  'copy-button': 'buttons',
  'flip-button': 'buttons',
  'github-stars-button': 'buttons',
  'icon-button': 'buttons',
  'liquid-button': 'buttons',
  'ripple-button': 'buttons',
  'theme-toggler-button': 'buttons',

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
  'scroll-fade': 'effects',
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
  if (!onlyAnimateUI || SHADCN_COMPONENTS.has(slug)) return 'components';
  return SECTIONS[slug] ?? 'animate-ui';
}
