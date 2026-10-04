'use client';

import * as React from 'react';
import { useSpring, type MotionValue, type SpringOptions } from 'motion/react';

import { useMotionTokens, useShouldReduceMotion } from '../../../utils/motion';

type ScrollFadeOrientation = 'vertical' | 'horizontal' | 'both';

type ScrollFadeEdge = 'top' | 'bottom' | 'left' | 'right';

type UseScrollFadeOptions = {
  /** Which axis fades: top/bottom, left/right or all four edges. */
  orientation?: ScrollFadeOrientation;
  /**
   * Depth of the fade, in pixels. It's also the scroll distance over which an
   * edge fades in: scroll `size` pixels away from it and it's fully faded.
   */
  size?: number;
  /**
   * Spring of the fade amount. `useSpring` options: `duration` in
   * milliseconds. Ignored under reduced motion: the fade follows the scroll
   * position at once.
   */
  transition?: SpringOptions;
  /** Apply the fade. */
  enabled?: boolean;
};

type ScrollFadeValues = Record<ScrollFadeEdge, MotionValue<number>>;

const EDGES: ScrollFadeEdge[] = ['top', 'bottom', 'left', 'right'];

const VAR = {
  top: '--scroll-fade-top',
  bottom: '--scroll-fade-bottom',
  left: '--scroll-fade-left',
  right: '--scroll-fade-right',
  size: '--scroll-fade-size',
} as const;

/**
 * One gradient per axis: opaque in the middle, and at each edge an alpha of
 * `1 - amount` (amount 0 → no fade at all, 1 → the edge is fully clear).
 * The depth stays constant; only how clear the edge gets animates.
 */
const edgeStop = (edge: ScrollFadeEdge) =>
  `rgb(0 0 0 / calc(1 - var(${VAR[edge]}, 0)))`;

const GRADIENT_Y = `linear-gradient(to bottom, ${edgeStop('top')} 0, #000 var(${VAR.size}), #000 calc(100% - var(${VAR.size})), ${edgeStop('bottom')} 100%)`;
const GRADIENT_X = `linear-gradient(to right, ${edgeStop('left')} 0, #000 var(${VAR.size}), #000 calc(100% - var(${VAR.size})), ${edgeStop('right')} 100%)`;

const MASKS: Record<ScrollFadeOrientation, string> = {
  vertical: GRADIENT_Y,
  horizontal: GRADIENT_X,
  both: `${GRADIENT_Y}, ${GRADIENT_X}`,
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function setMask(el: HTMLElement, mask: string | null) {
  const style = el.style;
  if (mask) {
    style.setProperty('mask-image', mask);
    style.setProperty('-webkit-mask-image', mask);
    style.setProperty('mask-composite', 'intersect');
    style.setProperty('-webkit-mask-composite', 'source-in');
  } else {
    for (const property of [
      'mask-image',
      '-webkit-mask-image',
      'mask-composite',
      '-webkit-mask-composite',
    ])
      style.removeProperty(property);
  }
}

/**
 * Fades the edges of a scroll container where there's content to scroll to,
 * and only there: no fade at an edge you're at, none at all when nothing
 * overflows. Works on any scroll element (e.g. a library's viewport), not just
 * `ScrollFade`.
 *
 * Each edge's amount is a spring driven by the scroll position, written to
 * CSS variables (`--scroll-fade-top`, `-bottom`, `-left`, `-right`, 0 to 1)
 * that a `mask-image` reads. Scrolling never re-renders React. The mask is
 * removed entirely while every edge is at 0.
 *
 * Returns the springs, should you want to drive something else with them.
 */
function useScrollFade(
  ref: React.RefObject<HTMLElement | null>,
  {
    orientation = 'vertical',
    size = 40,
    transition: transitionProp,
    enabled = true,
  }: UseScrollFadeOptions = {},
): ScrollFadeValues {
  const tokens = useMotionTokens();
  const reduce = useShouldReduceMotion();
  const transition: SpringOptions = transitionProp ?? {
    // useSpring takes its duration in milliseconds. No bounce: a fade has
    // nothing to overshoot.
    duration: tokens.duration.change * 1000,
    bounce: 0,
  };

  const top = useSpring(0, transition);
  const bottom = useSpring(0, transition);
  const left = useSpring(0, transition);
  const right = useSpring(0, transition);
  const values = React.useMemo(
    () => ({ top, bottom, left, right }),
    [top, bottom, left, right],
  );

  // Read from listeners: changing the preference doesn't resubscribe.
  const reduceRef = React.useRef(reduce);
  React.useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const vertical = orientation !== 'horizontal';
    const horizontal = orientation !== 'vertical';
    const mask = MASKS[orientation];
    let masked = false;

    el.style.setProperty(VAR.size, `${size}px`);

    const write = () => {
      let any = false;
      for (const edge of EDGES) {
        const amount = clamp01(values[edge].get());
        if (amount > 0.001) any = true;
        el.style.setProperty(VAR[edge], amount.toFixed(4));
      }
      if (any !== masked) {
        masked = any;
        setMask(el, any ? mask : null);
      }
    };

    const unsubscribe = EDGES.map((edge) => values[edge].on('change', write));

    /** Distance to scroll before an edge, in pixels, → 0 to 1. */
    const amount = (distance: number) =>
      size > 0 ? clamp01(distance / size) : distance > 0.5 ? 1 : 0;

    const measure = (instant: boolean) => {
      const targets: Record<ScrollFadeEdge, number> = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      };

      if (vertical) {
        const max = el.scrollHeight - el.clientHeight;
        // Sub-pixel rounding can leave 1px of fake overflow.
        if (max > 1) {
          targets.top = amount(el.scrollTop);
          targets.bottom = amount(max - el.scrollTop);
        }
      }

      if (horizontal) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 1) {
          // In RTL, scrollLeft runs from 0 (inline start, on the right) to
          // -max: measure from the inline start, then map to left/right.
          const fromStart = Math.abs(el.scrollLeft);
          const fromEnd = max - fromStart;
          const rtl = getComputedStyle(el).direction === 'rtl';
          targets.left = amount(rtl ? fromEnd : fromStart);
          targets.right = amount(rtl ? fromStart : fromEnd);
        }
      }

      for (const edge of EDGES) {
        if (instant || reduceRef.current) values[edge].jump(targets[edge]);
        else values[edge].set(targets[edge]);
      }
      // `jump` to an unchanged value fires no change event.
      write();
    };

    // First paint: the fade is already right, nothing animates in.
    measure(true);

    const onScroll = () => measure(false);
    el.addEventListener('scroll', onScroll, { passive: true });

    // Overflow changes when the container or its content resizes, or when
    // content is added or removed.
    const resizeObserver = new ResizeObserver(() => measure(false));
    const observeChildren = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(el);
      for (const child of el.children) resizeObserver.observe(child);
    };
    observeChildren();
    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      measure(false);
    });
    mutationObserver.observe(el, { childList: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      unsubscribe.forEach((off) => off());
      setMask(el, null);
      for (const name of Object.values(VAR)) el.style.removeProperty(name);
      for (const edge of EDGES) values[edge].jump(0);
    };
  }, [ref, enabled, orientation, size, values]);

  return values;
}

type ScrollFadeProps = React.ComponentProps<'div'> &
  UseScrollFadeOptions & {
    /**
     * Make the child element the scroll container instead of a wrapping div,
     * merging their props and refs.
     */
    asChild?: boolean;
  };

type ChildProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement | null>;
};

const OVERFLOW: Record<ScrollFadeOrientation, React.CSSProperties> = {
  vertical: { overflowY: 'auto' },
  horizontal: { overflowX: 'auto' },
  both: { overflow: 'auto' },
};

function ScrollFade({
  ref,
  asChild = false,
  orientation = 'vertical',
  size,
  transition,
  enabled,
  style,
  children,
  ...props
}: ScrollFadeProps) {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  useScrollFade(localRef, { orientation, size, transition, enabled });

  const sharedProps = {
    'data-slot': 'scroll-fade',
    'data-orientation': orientation,
    ...props,
  };

  if (asChild && React.isValidElement<ChildProps>(children)) {
    // A plain slot (no Motion element needed): the hook writes the DOM.
    const child = children;
    const childRef = child.props.ref;
    return React.cloneElement(child, {
      ...child.props,
      ...sharedProps,
      className:
        [child.props.className, props.className].filter(Boolean).join(' ') ||
        undefined,
      style: { ...OVERFLOW[orientation], ...child.props.style, ...style },
      ref: (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof childRef === 'function') childRef(node);
        else if (childRef) childRef.current = node;
      },
    });
  }

  return (
    <div
      ref={localRef}
      style={{ ...OVERFLOW[orientation], ...style }}
      {...sharedProps}
    >
      {children}
    </div>
  );
}

export {
  ScrollFade,
  useScrollFade,
  type ScrollFadeProps,
  type ScrollFadeOrientation,
  type ScrollFadeValues,
  type UseScrollFadeOptions,
};
