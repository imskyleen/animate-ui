import type { EmblaCarouselType } from 'embla-carousel';

type Axis = 'x' | 'y';

// What `scale` moves: the slide's content, as Embla moves the slide itself
// around a loop (with a transform the `scale` property would shrink too).
function contentOf(slide: HTMLElement) {
  return (slide.firstElementChild as HTMLElement | null) ?? slide;
}

// The slides shown on each side of the selected one.
function sideOf(visible = 3) {
  return Math.max(0, Math.floor(visible / 2));
}

// A slide's scale, `away` slides from the center: `scale` more per slide out
// to the side ones, a little less again for the ones waiting behind them.
function scaleAt(away: number, scale: number, side: number) {
  const at = (n: number) =>
    n <= side
      ? scale ** n
      : side === 0
        ? scale
        : scale ** side - 0.6 * (scale ** (side - 1) - scale ** side);
  const a = Math.min(away, side + 1);
  const below = Math.floor(a);
  return at(below) + (at(Math.ceil(a)) - at(below)) * (a - below);
}

// Where a slide's center sits, `away` slides out, in px: the slides keep `gap`
// between them out to the side ones.
function placeAt(
  away: number,
  size: number,
  gap: number,
  scale: number,
  side: number,
) {
  const whole = Math.floor(away);
  const part = away - whole;
  let at = part * ((size * (1 + scaleAt(1, scale, side))) / 2 + gap);
  for (let n = 1; n <= whole; n++)
    at +=
      (size *
        (scaleAt(part + n - 1, scale, side) + scaleAt(part + n, scale, side))) /
        2 +
      gap;
  return at;
}

function gapOf(slide: HTMLElement, axis: Axis) {
  const padding = getComputedStyle(slide);
  return axis === 'x'
    ? parseFloat(padding.paddingLeft) + parseFloat(padding.paddingRight)
    : parseFloat(padding.paddingTop) + parseFloat(padding.paddingBottom);
}

// `visible` slides edge to edge: each slide's basis, in whole pixels (Embla
// measures the slides rounded), from the viewport and the slides' gap.
function sizeSlides(
  viewport: HTMLElement,
  axis: Axis,
  visible: number,
  scale: number,
) {
  const slides = [
    ...(viewport.firstElementChild?.children ?? []),
  ] as HTMLElement[];
  if (!slides[0]) return;
  const side = sideOf(visible);
  const gap = gapOf(slides[0], axis);
  const box = viewport.getBoundingClientRect();
  const length = axis === 'x' ? box.width : box.height;
  const edge =
    placeAt(side, 1, 0, scale, side) +
    (visible % 2 ? scaleAt(side, scale, side) / 2 : 0);
  const size = ((length - 1) / 2 - gap * side) / edge;
  const basis = `${Math.max(0, Math.floor(size + gap))}px`;
  for (const slide of slides)
    if (slide.style.flexBasis !== basis) slide.style.flexBasis = basis;
}

function unsizeSlides(viewport: HTMLElement) {
  for (const slide of viewport.firstElementChild?.children ?? [])
    (slide as HTMLElement).style.flexBasis = '';
}

// What stays put while the slides scroll, measured again when they resize:
// where Embla centers them (on their container, margins included), and each
// slide's length and gap. Exact sizes: offsetWidth rounds, and the content is
// scaled.
function measureSlides(api: EmblaCarouselType, axis: Axis) {
  const container = api.containerNode();
  const style = getComputedStyle(container);
  const box = container.getBoundingClientRect();
  return {
    center:
      axis === 'x'
        ? parseFloat(style.marginLeft) + box.width / 2
        : parseFloat(style.marginTop) + box.height / 2,
    slides: api.slideNodes().map((slide) => {
      const size = slide.getBoundingClientRect();
      return {
        step: axis === 'x' ? size.width : size.height,
        gap: gapOf(slide, axis),
      };
    }),
  };
}

type Measures = ReturnType<typeof measureSlides>;

// How far each slide is from the center, in slides: 0 there, 1 for its
// neighbours, negative before it. Read from where Embla put each slide.
function slideDistances(api: EmblaCarouselType, axis: Axis, center: number) {
  const view = api.rootNode().getBoundingClientRect();
  const origin = (axis === 'x' ? view.left : view.top) + center;
  return api.slideNodes().map((slide) => {
    const box = slide.getBoundingClientRect();
    return axis === 'x'
      ? (box.left + box.width / 2 - origin) / box.width
      : (box.top + box.height / 2 - origin) / box.height;
  });
}

// Scaled: the slides shrink away from the center and close up on it, out to
// the side ones; the slides past them wait behind. In a loop, each slide takes
// the nearest way around, so both sides fill up.
function applyScale(
  slide: HTMLElement,
  distance: number,
  scale: number,
  side: number,
  axis: Axis,
  loop: number,
  step: number,
  gap: number,
) {
  const wrapped = loop
    ? distance - loop * Math.round(distance / loop)
    : distance;
  const away = Math.abs(wrapped);
  const content = contentOf(slide);
  const size = step - gap;
  const behind = Math.min(Math.max(away - side, 0), 1);
  const now = scaleAt(away, scale, side);
  const at =
    placeAt(Math.min(away, side), size, gap, scale, side) +
    ((size * (scaleAt(side, scale, side) - now)) / 2) * Math.sign(behind) +
    size * 0.25 * Math.sin(Math.PI * behind) -
    2 * behind;
  const offset = Math.sign(wrapped) * at - distance * step;
  content.style.scale = String(now);
  content.style.translate = axis === 'x' ? `${offset}px 0` : `0 ${offset}px`;
  // Past the ones behind, a slide stays out of sight until it comes back.
  content.style.opacity = away > side + 1 ? '0' : '';
  slide.style.zIndex = String(100 - Math.round(away * 10));
  // Out of sight, behind the others or past the edges: out of reach too.
  const hidden = away > side + 0.5;
  if (slide.inert !== hidden) {
    slide.inert = hidden;
    if (hidden) slide.setAttribute('aria-hidden', 'true');
    else slide.removeAttribute('aria-hidden');
  }
}

function clearScale(api: EmblaCarouselType) {
  for (const slide of api.slideNodes()) {
    const content = contentOf(slide);
    content.style.scale = '';
    content.style.translate = '';
    content.style.opacity = '';
    slide.style.zIndex = '';
    slide.inert = false;
    slide.removeAttribute('aria-hidden');
  }
}

const ARROWS =
  ':scope > [data-slot="carousel-previous"], :scope > [data-slot="carousel-next"]';

// shadcn/ui centers the arrows on the whole carousel and hangs the vertical
// ones off its edges: what sits under the slides (dots, a counter) pulls them
// off. They move by the difference, along the screen, whatever their rotation.
function alignArrows(root: HTMLElement, viewport: HTMLElement, axis: Axis) {
  const before = viewport.offsetTop;
  const after = root.clientHeight - before - viewport.offsetHeight;
  for (const arrow of root.querySelectorAll<HTMLElement>(ARROWS)) {
    const next = arrow.dataset.slot === 'carousel-next';
    const by = axis === 'x' ? (before - after) / 2 : next ? -after : before;
    if (!by) {
      arrow.style.transform = '';
      continue;
    }
    arrow.style.transform = '';
    const turn = getComputedStyle(arrow).rotate;
    const angle = turn && turn !== 'none' ? turn : '0deg';
    arrow.style.transform = `rotate(calc(${angle} * -1)) translateY(${by}px) rotate(${angle})`;
  }
}

function unalignArrows(root: HTMLElement) {
  for (const arrow of root.querySelectorAll<HTMLElement>(ARROWS))
    arrow.style.transform = '';
}

// Where the dots' pill goes: from the current dot toward the next, its front
// over the first half of the way and its back over the second. Past the last
// dot, a loop heads back to the first one.
function pillSpan(api: EmblaCarouselType) {
  const snaps = api.scrollSnapList().length;
  const loop = api.internalEngine().options.loop;
  const position = loop
    ? (((api.scrollProgress() * snaps) % snaps) + snaps) % snaps
    : Math.max(0, Math.min(api.scrollProgress() * (snaps - 1), snaps - 1));
  const from = Math.min(Math.floor(position), snaps - 1);
  const t = position - from;
  const to = from === snaps - 1 ? (loop ? 0 : from) : from + 1;
  const lead = from + (to - from) * Math.min(1, t * 2);
  const trail = from + (to - from) * Math.max(0, (t - 0.5) * 2);
  return { start: Math.min(lead, trail), end: Math.max(lead, trail) };
}

// The carousels the dots and counter read from, found from inside them.
const carousels = new WeakMap<HTMLElement, EmblaCarouselType>();
const listeners = new WeakMap<
  HTMLElement,
  Set<(api: EmblaCarouselType | undefined) => void>
>();

function rootOf(node: Element | null | undefined) {
  return node?.closest<HTMLElement>('[data-slot="carousel"]') ?? null;
}

function publish(root: HTMLElement, api: EmblaCarouselType | undefined) {
  if (api) carousels.set(root, api);
  else carousels.delete(root);
  listeners.get(root)?.forEach((listener) => listener(api));
}

function subscribe(
  root: HTMLElement,
  listener: (api: EmblaCarouselType | undefined) => void,
) {
  const set = listeners.get(root) ?? new Set();
  listeners.set(root, set);
  set.add(listener);
  listener(carousels.get(root));
  return () => {
    set.delete(listener);
  };
}

// The dots' look, under the page's own styles.
const DOTS_CSS =
  '@layer base{' +
  '[data-slot="carousel-dots"]{position:relative;display:flex;align-items:center;gap:.5rem}' +
  '[data-slot="carousel-dot"]{width:.5rem;height:.5rem;padding:0;border:0;border-radius:9999px;background:currentColor;opacity:.2;cursor:pointer}' +
  '[data-slot="carousel-dots-indicator"]{position:absolute;top:50%;left:0;height:.5rem;border-radius:9999px;background:currentColor;pointer-events:none}' +
  '[data-slot="carousel-counter"]{font-variant-numeric:tabular-nums}' +
  '}';

export {
  type Axis,
  type Measures,
  DOTS_CSS,
  alignArrows,
  applyScale,
  clearScale,
  measureSlides,
  pillSpan,
  publish,
  rootOf,
  sideOf,
  sizeSlides,
  slideDistances,
  subscribe,
  unalignArrows,
  unsizeSlides,
};
