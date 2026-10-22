import { computed, onScopeDispose, watch, type ComputedRef } from 'vue';
import type { Transition } from 'motion-v';

import {
  motionTokens,
  toCssTiming,
  useShouldReduceMotion,
  useTempoTransition,
} from '../utils/motion';

const ROWS = [
  '[role^="menuitem"]',
  '[role="option"]',
  '[role="separator"]',
  '[data-slot$="-label"]',
  '[data-slot="navigation-menu-link"]',
  '[data-slot="sidebar-menu-sub-item"]',
].join(',');

const STAGGER = { duration: 0.3, ease: motionTokens.ease.soft, delay: 0.033 };
const SHIFT = 8;
const ARRIVE = { duration: 0.1, ease: motionTokens.ease.out };
const CALM = 10;
const STAGGER_ID = 'animate-ui-stagger';

type StaggerTiming = { duration: number; easing: string; step: number };

function opacityOf(el: Element) {
  let opacity = 1;
  for (let node: Element | null = el; node; node = node.parentElement)
    opacity *= Number(getComputedStyle(node).opacity);
  return opacity;
}

function rowsOf(root: HTMLElement) {
  const rows = [...root.querySelectorAll<HTMLElement>(ROWS)].filter(
    (row) => !row.closest('[data-animate-ui-handoff]'),
  );
  return rows.filter(
    (row) => !rows.some((other) => other !== row && other.contains(row)),
  );
}

function animateRows(rows: HTMLElement[], timing: StaggerTiming) {
  const shift =
    rows[0] && getComputedStyle(rows[0]).direction === 'rtl' ? -SHIFT : SHIFT;
  const step =
    rows.length > CALM
      ? timing.step * Math.sqrt(CALM / rows.length)
      : timing.step;
  return rows.map((row, index) =>
    row.animate(
      [
        {
          opacity: 0,
          filter: motionTokens.blur.surface,
          translate: `${shift}px 0`,
        },
        // No opacity here: it ends on the row's own, a disabled one's 50% or one the library shows late.
        { filter: 'blur(0px)', translate: '0 0' },
      ],
      {
        duration: timing.duration,
        easing: timing.easing,
        delay: index * step,
        fill: 'backwards',
        id: STAGGER_ID,
      },
    ),
  );
}

/** How long until `row` lands from its stagger (0 when it isn't staggering). */
function staggerLeft(row: Element | null) {
  const animation = row
    ?.getAnimations()
    .find((candidate) => candidate.id === STAGGER_ID);
  if (!animation || animation.playState === 'finished') return 0;
  const end = animation.effect?.getComputedTiming().endTime;
  return Math.max(0, Number(end ?? 0) - Number(animation.currentTime ?? 0));
}

/**
 * A just-opened list's rows slide in from the side one after another, out of a blur;
 * rows a library renders a commit later (React Aria's) as they come, before
 * they're painted. `stop` shows them all.
 */
/**
 * Rows slid aside widen what their list can scroll: a library scrolling the
 * chosen one into view (Base UI's combobox) would scroll sideways too, then
 * back as they land. The lists keep their horizontal scroll meanwhile.
 */
function holdScrollX(root: HTMLElement) {
  const lefts = new Map<Element, number>();
  for (const el of [root, ...root.querySelectorAll('*')])
    lefts.set(el, el.scrollLeft);
  const hold = (event: Event) => {
    const target = event.target as Element;
    const left = lefts.get(target);
    if (left !== undefined && target.scrollLeft !== left)
      target.scrollLeft = left;
  };
  root.addEventListener('scroll', hold, true);
  return () => root.removeEventListener('scroll', hold, true);
}

function staggerRows(root: HTMLElement, timing: StaggerTiming) {
  let animations: Animation[] = [];
  let observer: MutationObserver | null = null;
  const release = holdScrollX(root);
  const start = (rows: HTMLElement[]) => {
    animations = animateRows(rows, timing);
    void Promise.all(animations.map((animation) => animation.finished)).then(
      release,
      release,
    );
  };
  const rows = rowsOf(root);
  if (rows.length) start(rows);
  else {
    observer = new MutationObserver(() => {
      const late = rowsOf(root);
      if (!late.length) return;
      observer?.disconnect();
      observer = null;
      start(late);
    });
    observer.observe(root, { childList: true, subtree: true });
    setTimeout(() => {
      if (!observer) return;
      observer.disconnect();
      release();
    }, 300);
  }
  return () => {
    observer?.disconnect();
    for (const animation of animations) animation.finish();
    release();
  };
}

/** Staggers `el`'s rows if it opens from closed: it's still transparent. */
function staggerFromClosed(el: HTMLElement, timing: StaggerTiming) {
  return opacityOf(el) > 0.05 ? null : staggerRows(el, timing);
}

function useStaggerTiming() {
  const transition = useTempoTransition(() => STAGGER);
  return (): StaggerTiming => ({
    ...toCssTiming(transition.value),
    step: ((transition.value as { delay?: number }).delay ?? 0) * 1000,
  });
}

/**
 * Staggers the rows of `element`'s list as it opens from closed (it starts
 * transparent, or `fresh` says so), not as it comes back while closing or
 * takes over another menu's popover.
 */
function useStaggerOnOpen(
  element: () => HTMLElement | null | undefined,
  open: () => boolean,
  options: {
    skip?: () => boolean;
    fresh?: () => boolean | undefined;
    closed?: (el: HTMLElement) => boolean;
  } = {},
) {
  const reduce = useShouldReduceMotion();
  const timing = useStaggerTiming();
  const closed = options.closed ?? ((el: HTMLElement) => opacityOf(el) <= 0.05);
  let stop: (() => void) | null = null;
  watch(
    [open, element] as const,
    ([isOpen, el], previous) => {
      if (!isOpen) {
        stop?.();
        stop = null;
        return;
      }
      if (previous && previous[0] && previous[1] === el) return;
      if (!el || reduce.value || options.skip?.()) return;
      const fresh = options.fresh?.();
      if (fresh === undefined ? !closed(el) : !fresh) return;
      stop?.();
      stop = staggerRows(el, timing());
    },
    { flush: 'post', immediate: true },
  );
  onScopeDispose(() => stop?.());
}

/** A sidebar's submenu, in a collapsible panel: its sub-items stagger as it unfolds from closed. */
function useSubmenuStagger(
  element: () => HTMLElement | null | undefined,
  open: () => boolean,
) {
  useStaggerOnOpen(element, open, {
    closed: (el) =>
      el.offsetHeight < 1 &&
      !!el.querySelector('[data-slot="sidebar-menu-sub"]'),
  });
}

/** A list whose rows stagger: its box is there at once (opacity), its rows bring the fade; under reduced motion, nothing staggers and it fades. */
function useStaggeredEnter(enter: () => Transition): ComputedRef<Transition> {
  const reduce = useShouldReduceMotion();
  const arrive = useTempoTransition(() => ARRIVE);
  return computed(() =>
    reduce.value ? enter() : { ...enter(), opacity: arrive.value },
  );
}

/**
 * A sidebar submenu's panel is there at once (opacity, blur) while it unfolds,
 * so its sub-items bring the fade: added over the panel's own animation, after it starts.
 */
function quickSubmenuPanel(el: HTMLElement | null) {
  if (!el?.querySelector('[data-slot="sidebar-menu-sub"]')) return;
  queueMicrotask(() => {
    const ends = el
      .getAnimations()
      .map((animation) =>
        Number(animation.effect?.getComputedTiming().endTime ?? 0),
      );
    const total = Math.max(300, ...ends);
    const settled = { opacity: 1, filter: 'blur(0px)' };
    el.animate(
      [
        { ...settled, offset: Math.min(1, 100 / total) },
        { ...settled, offset: 1 },
      ],
      { duration: total, easing: 'ease-out' },
    );
  });
}

export {
  quickSubmenuPanel,
  staggerFromClosed,
  useStaggeredEnter,
  staggerLeft,
  staggerRows,
  useStaggerOnOpen,
  useStaggerTiming,
  useSubmenuStagger,
  type StaggerTiming,
};
