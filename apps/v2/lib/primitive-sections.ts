export type PrimitiveSection =
  'components' | 'animate-ui' | 'buttons' | 'texts' | 'effects';

const SHADCN_COMPONENTS = new Set(['input-otp']);

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

export function primitiveSection(
  slug: string,
  onlyAnimateUI: boolean,
): PrimitiveSection {
  if (!onlyAnimateUI || SHADCN_COMPONENTS.has(slug)) return 'components';
  return SECTIONS[slug] ?? 'animate-ui';
}
