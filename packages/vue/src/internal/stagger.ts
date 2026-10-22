import { onScopeDispose, watch } from 'vue';

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
        { opacity: 1, filter: 'blur(0px)', translate: '0 0' },
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
function staggerRows(root: HTMLElement, timing: StaggerTiming) {
  let animations: Animation[] = [];
  let observer: MutationObserver | null = null;
  const rows = rowsOf(root);
  if (rows.length) animations = animateRows(rows, timing);
  else {
    observer = new MutationObserver(() => {
      const late = rowsOf(root);
      if (!late.length) return;
      observer?.disconnect();
      observer = null;
      animations = animateRows(late, timing);
    });
    observer.observe(root, { childList: true, subtree: true });
    setTimeout(() => observer?.disconnect(), 300);
  }
  return () => {
    observer?.disconnect();
    for (const animation of animations) animation.finish();
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

export {
  staggerFromClosed,
  staggerLeft,
  staggerRows,
  useStaggerOnOpen,
  useStaggerTiming,
  useSubmenuStagger,
  type StaggerTiming,
};
