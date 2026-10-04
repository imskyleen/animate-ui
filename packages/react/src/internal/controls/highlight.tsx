'use client';

import * as React from 'react';
import {
  animate,
  cancelFrame,
  motionValue,
  type AnimationPlaybackControls,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';

// The highlight of a single-selection toggle group, as Animate UI v1's
// `ToggleGroupHighlight` (a shared layout animation): when another item is
// selected, the highlight slides from the previous item to it on a spring
// (stiffness 200, damping 25), the new highlight fading in while the previous
// one fades out as it follows; the first selection fades it in, clearing the
// selection fades it out. Multiple-selection groups have no highlight.
//
// shadcn/ui colours the selected item itself (`data-[state=on]:bg-muted`). To
// make that surface slide without touching the component, the group draws
// the highlight with its own `::before` (the previous surface) and `::after`
// (the new one), behind its items, with the selected item's background and
// corner radii; a small stylesheet clears the selected item's background
// while it isn't hovered (hovered, its own background shows on top, as v1's
// item hover did over the highlight). Pseudo-elements leave the items'
// `:first-child` / `:last-child` styles alone, and paint under their borders.

/** Set on every animated item, so the stylesheet only touches ours. */
const ITEM_ATTRIBUTE = 'data-animate-ui-toggle-item';
/** Set on the group while its highlight is drawn (value: the library). */
const READY_ATTRIBUTE = 'data-animate-ui-highlight';

/** v1's `ToggleGroupHighlight` transition (slide and fades). */
const HIGHLIGHT_TRANSITION: Transition = motionTokens.spring.selection;

/** The attributes the group's items carry when selected, per library. */
const SELECTED = {
  radix: '[data-state="on"]',
  base: '[aria-pressed="true"]',
  aria: '[data-selected]',
} as const;

type HighlightLibrary = keyof typeof SELECTED;

const itemSelector = (library: HighlightLibrary) =>
  `[${ITEM_ATTRIBUTE}]${SELECTED[library]}`;

const v = (name: string) => `--animate-ui-highlight-${name}`;

// Unlayered, so it wins over Tailwind's layered utilities.
const HIGHLIGHT_CSS = [
  `[${READY_ATTRIBUTE}]::before,[${READY_ATTRIBUTE}]::after{content:"";position:absolute;z-index:-1;margin:0;pointer-events:none;left:var(${v('x')});top:var(${v('y')});width:var(${v('width')});height:var(${v('height')})}`,
  `[${READY_ATTRIBUTE}]::before{background-color:var(${v('from-color')});background-image:var(${v('from-image')});border-radius:var(${v('from-radius')});opacity:var(${v('from-opacity')})}`,
  `[${READY_ATTRIBUTE}]::after{background-color:var(${v('to-color')});background-image:var(${v('to-image')});border-radius:var(${v('to-radius')});opacity:var(${v('to-opacity')})}`,
  ...(Object.keys(SELECTED) as HighlightLibrary[]).map(
    (library) =>
      `[${READY_ATTRIBUTE}="${library}"] ${itemSelector(library)}:not(:hover){background-color:transparent;background-image:none}`,
  ),
].join('');

type Box = { x: number; y: number; width: number; height: number };
type Look = { color: string; image: string; radius: string };
type Surface = Box & Look & { item: Element };

/** The selected item's own background, read without our stylesheet. */
function readLook(root: HTMLElement, item: HTMLElement): Look {
  const ready = root.getAttribute(READY_ATTRIBUTE);
  const transition = item.style.transition;
  // Its CSS transition would report where its colour starts.
  item.style.transition = 'none';
  if (ready !== null) root.removeAttribute(READY_ATTRIBUTE);
  const style = getComputedStyle(item);
  const look = {
    color: style.backgroundColor,
    image: style.backgroundImage,
    radius: `${style.borderTopLeftRadius} ${style.borderTopRightRadius} ${style.borderBottomRightRadius} ${style.borderBottomLeftRadius}`,
  };
  if (ready !== null) root.setAttribute(READY_ATTRIBUTE, ready);
  // Applied while transitions are off, so clearing it doesn't fade.
  void getComputedStyle(item).backgroundColor;
  item.style.transition = transition;
  return look;
}

/** The group's own selected item and its surface, in the group's pixels. */
function readSurface(
  root: HTMLElement,
  library: HighlightLibrary,
): Surface | null {
  const item = Array.from(
    root.querySelectorAll<HTMLElement>(itemSelector(library)),
  ).find((el) => el.parentElement?.closest(`[${READY_GROUP}]`) === root);
  if (!item) return null;
  // Layout coordinates inside the group (its padding box, where an absolute
  // child is placed), whatever transform an ancestor has.
  const rootRect = root.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  const scaleX = root.offsetWidth ? rootRect.width / root.offsetWidth : 1;
  const scaleY = root.offsetHeight ? rootRect.height / root.offsetHeight : 1;
  return {
    item,
    x: (rect.left - rootRect.left) / scaleX - root.clientLeft + root.scrollLeft,
    y: (rect.top - rootRect.top) / scaleY - root.clientTop + root.scrollTop,
    width: rect.width / scaleX,
    height: rect.height / scaleY,
    ...readLook(root, item),
  };
}

/** Set on the group (single selection), to tell its own items apart. */
const READY_GROUP = 'data-animate-ui-toggle-group';

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

type HighlightState = {
  progress: ReturnType<typeof motionValue<number>>;
  controls: AnimationPlaybackControls | null;
  /** The slide waiting for the next frame to start. */
  pending: (() => void) | null;
  /** The previous surface (fading out) and the new one (fading in). */
  from: Surface | null;
  to: Surface | null;
  /** Under reduced motion the highlight jumps, its fades still play. */
  jump: boolean;
};

/** Writes the highlight at progress `p` on the group. */
function draw(root: HTMLElement, s: HighlightState, p: number) {
  const a = s.from ?? s.to;
  const b = s.to ?? s.from;
  if (!a || !b) return;
  const t = s.jump ? 1 : p;
  const set = (name: string, value: string) =>
    root.style.setProperty(v(name), value);
  set('x', `${lerp(a.x, b.x, t)}px`);
  set('y', `${lerp(a.y, b.y, t)}px`);
  set('width', `${lerp(a.width, b.width, t)}px`);
  set('height', `${lerp(a.height, b.height, t)}px`);
  set('from-opacity', String(s.from ? Math.min(1, Math.max(0, 1 - p)) : 0));
  set('to-opacity', String(s.to ? Math.min(1, Math.max(0, p)) : 0));
  for (const [key, look] of [
    ['from', s.from],
    ['to', s.to],
  ] as const) {
    if (!look) continue;
    set(`${key}-color`, look.color);
    set(`${key}-image`, look.image);
    set(`${key}-radius`, look.radius);
  }
}

type ToggleGroupHighlightOptions = {
  library: HighlightLibrary;
  /** Single selection only. */
  enabled: boolean;
  transition?: Transition;
};

/**
 * The highlight of a toggle group: render `style` anywhere in the group and
 * spread `rootProps` on the group's element; mark its items with
 * `toggleGroupItemProps`.
 */
function useToggleGroupHighlight(
  root: HTMLElement | null,
  { library, enabled, transition }: ToggleGroupHighlightOptions,
) {
  const spring = useTempoTransition(transition ?? HIGHLIGHT_TRANSITION);
  const reduce = useShouldReduceMotion();
  const latestRef = React.useRef({ spring, reduce });
  React.useLayoutEffect(() => {
    latestRef.current = { spring, reduce };
  });

  React.useLayoutEffect(() => {
    if (!root || !enabled) return;
    // The highlight is positioned inside the group, behind its items.
    if (getComputedStyle(root).position === 'static')
      root.style.setProperty('position', 'relative');
    root.style.setProperty('isolation', 'isolate');

    const s: HighlightState = {
      progress: motionValue(1),
      controls: null,
      pending: null,
      from: null,
      to: null,
      jump: false,
    };
    const stopDrawing = s.progress.on('change', (p) => draw(root, s, p));

    const settle = () => {
      s.controls = null;
      s.from = null;
      if (s.to) draw(root, s, 1);
      else root.removeAttribute(READY_ATTRIBUTE);
    };

    const update = (first: boolean) => {
      const next = readSurface(root, library);
      const current = s.to;
      if (next && current && next.item === current.item) {
        // The same item, resized or restyled: followed at once.
        s.to = next;
        draw(root, s, s.progress.get());
        return;
      }
      if (!next && !current) return;
      if (first) {
        // At rest on mount, as v1's `AnimatePresence initial={false}`.
        s.to = next;
        if (next) {
          root.setAttribute(READY_ATTRIBUTE, library);
          s.progress.jump(1);
          draw(root, s, 1);
        }
        return;
      }
      // The surface on screen now leaves from where it is (mid-slide
      // included), the new one arrives from there. Nothing on screen (or
      // only a surface fading out): the new one fades in at its item.
      if (current) {
        const p = s.jump ? 1 : s.progress.get();
        const a = s.from ?? current;
        s.from = {
          ...current,
          x: lerp(a.x, current.x, p),
          y: lerp(a.y, current.y, p),
          width: lerp(a.width, current.width, p),
          height: lerp(a.height, current.height, p),
        };
      } else s.from = null;
      s.to = next;
      s.jump = latestRef.current.reduce;
      root.setAttribute(READY_ATTRIBUTE, library);
      s.controls?.stop();
      s.controls = null;
      if (s.pending) cancelFrame(s.pending);
      s.progress.jump(0);
      // Started right away, as v1's layout animation was: the spring's clock
      // starts with this frame, like production.
      const start = () => {
        s.pending = null;
        const controls = animate(s.progress, 1, latestRef.current.spring);
        s.controls = controls;
        void controls.then(() => {
          if (s.controls === controls) settle();
        });
      };
      start();
    };

    const resize = new ResizeObserver(() => update(false));
    const observeItems = () => {
      resize.observe(root);
      for (const item of root.querySelectorAll(`[${ITEM_ATTRIBUTE}]`))
        resize.observe(item);
    };
    const mutations = new MutationObserver(() => {
      observeItems();
      update(false);
    });
    mutations.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'class',
        'data-state',
        'aria-pressed',
        'data-selected',
        'data-disabled',
        'data-orientation',
      ],
    });
    observeItems();
    update(true);

    return () => {
      mutations.disconnect();
      resize.disconnect();
      stopDrawing();
      s.controls?.stop();
      if (s.pending) cancelFrame(s.pending);
      root.removeAttribute(READY_ATTRIBUTE);
    };
  }, [root, enabled, library]);

  return {
    style: enabled ? (
      <style href="animate-ui-toggle-group-highlight" precedence="animate-ui">
        {HIGHLIGHT_CSS}
      </style>
    ) : null,
    rootProps: {
      [READY_GROUP]: enabled ? '' : undefined,
    } as Record<string, string | undefined>,
  };
}

/** Marks an animated item of a toggle group (spread on the item). */
const toggleGroupItemProps = { [ITEM_ATTRIBUTE]: '' } as Record<string, string>;

export {
  HIGHLIGHT_TRANSITION,
  useToggleGroupHighlight,
  toggleGroupItemProps,
  type HighlightLibrary,
};
