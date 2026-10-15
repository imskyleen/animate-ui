'use client';

import * as React from 'react';
import {
  animate,
  useMotionValue,
  type MotionValue,
  type Transition,
} from 'motion/react';

import { mergeRefs } from '../../../internal/anchored';
import {
  motionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

const SETTLE = motionTokens.transition.fade;

type ScrollFadeOrientation = 'vertical' | 'horizontal' | 'both';

type ScrollFadeEdge = 'top' | 'bottom' | 'left' | 'right';

type UseScrollFadeOptions = {
  orientation?: ScrollFadeOrientation;
  size?: number;
  shrink?: number;
  transition?: Transition;
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

const edgeStop = (edge: ScrollFadeEdge) =>
  `rgb(0 0 0 / calc(1 - var(${VAR[edge]}, 0)))`;
const depth = (edge: ScrollFadeEdge) =>
  `calc(var(${VAR.size}) * min(1, var(${VAR[edge]}, 0) * 1000))`;

const GRADIENT_Y = `linear-gradient(to bottom, ${edgeStop('top')} 0, #000 ${depth('top')}, #000 calc(100% - ${depth('bottom')}), ${edgeStop('bottom')} 100%)`;
const GRADIENT_X = `linear-gradient(to right, ${edgeStop('left')} 0, #000 ${depth('left')}, #000 calc(100% - ${depth('right')}), ${edgeStop('right')} 100%)`;

const MASKS: Record<ScrollFadeOrientation, string> = {
  vertical: GRADIENT_Y,
  horizontal: GRADIENT_X,
  both: `${GRADIENT_Y}, ${GRADIENT_X}`,
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function itemsOf(el: HTMLElement) {
  let parent: Element = el;
  while (parent.children.length === 1) parent = parent.children[0]!;
  return Array.from(parent.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

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

function useScrollFade(
  ref: React.RefObject<HTMLElement | null>,
  {
    orientation = 'vertical',
    size = 40,
    shrink = 0.05,
    transition: transitionProp,
    enabled = true,
  }: UseScrollFadeOptions = {},
): ScrollFadeValues {
  const reduce = useShouldReduceMotion();
  const settle = useTempoTransition(transitionProp ?? SETTLE);
  const settleRef = React.useRef(settle);
  React.useEffect(() => {
    settleRef.current = settle;
  });

  const top = useMotionValue(0);
  const bottom = useMotionValue(0);
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const values = React.useMemo(
    () => ({ top, bottom, left, right }),
    [top, bottom, left, right],
  );

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

    const shrunk = new Set<HTMLElement>();
    const restore = () => {
      for (const item of shrunk) item.style.removeProperty('scale');
      shrunk.clear();
    };
    const shrinkItems = () => {
      if (!shrink || reduceRef.current) return restore();
      const box = el.getBoundingClientRect();
      for (const item of itemsOf(el)) {
        const rect = item.getBoundingClientRect();
        let depth = 0;
        if (vertical) {
          const center = rect.top + rect.height / 2;
          depth = Math.max(
            clamp01(1 - (center - box.top) / size) * values.top.get(),
            clamp01(1 - (box.bottom - center) / size) * values.bottom.get(),
          );
        }
        if (horizontal) {
          const center = rect.left + rect.width / 2;
          depth = Math.max(
            depth,
            clamp01(1 - (center - box.left) / size) * values.left.get(),
            clamp01(1 - (box.right - center) / size) * values.right.get(),
          );
        }
        if (depth > 0.001) {
          item.style.scale = String(1 - shrink * depth);
          shrunk.add(item);
        } else if (shrunk.delete(item)) item.style.removeProperty('scale');
      }
    };

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
      shrinkItems();
    };

    const unsubscribe = EDGES.map((edge) => values[edge].on('change', write));

    const ramp = size / 2;
    const amount = (distance: number) =>
      ramp > 0 ? clamp01(distance / ramp) : distance > 0.5 ? 1 : 0;

    const measure = (follow: boolean) => {
      const targets: Record<ScrollFadeEdge, number> = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      };

      if (vertical) {
        const max = el.scrollHeight - el.clientHeight;
        if (max > 1) {
          targets.top = amount(el.scrollTop);
          targets.bottom = amount(max - el.scrollTop);
        }
      }

      if (horizontal) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 1) {
          const fromStart = Math.abs(el.scrollLeft);
          const fromEnd = max - fromStart;
          const rtl = getComputedStyle(el).direction === 'rtl';
          targets.left = amount(rtl ? fromEnd : fromStart);
          targets.right = amount(rtl ? fromStart : fromEnd);
        }
      }

      for (const edge of EDGES) {
        if (follow || reduceRef.current) values[edge].jump(targets[edge]);
        else if (Math.abs(values[edge].get() - targets[edge]) > 0.001)
          animate(values[edge], targets[edge], settleRef.current);
      }
      write();
    };

    measure(true);

    const onScroll = () => measure(true);
    el.addEventListener('scroll', onScroll, { passive: true });

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
      restore();
      for (const name of Object.values(VAR)) el.style.removeProperty(name);
      for (const edge of EDGES) values[edge].jump(0);
    };
  }, [ref, enabled, orientation, size, shrink, values]);

  return values;
}

type ScrollFadeProps = React.ComponentProps<'div'> &
  UseScrollFadeOptions & {
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
  shrink,
  transition,
  enabled,
  style,
  children,
  ...props
}: ScrollFadeProps) {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const ownRef = React.isValidElement<ChildProps>(children)
    ? children.props.ref
    : undefined;
  const childRef = React.useMemo(
    () => mergeRefs<HTMLElement | null>(localRef, ownRef),
    [ownRef],
  );
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  useScrollFade(localRef, {
    orientation,
    size,
    shrink,
    transition,
    enabled,
  });

  const sharedProps = {
    'data-slot': 'scroll-fade',
    'data-orientation': orientation,
    ...props,
  };

  if (asChild && React.isValidElement<ChildProps>(children)) {
    const child = children;
    return React.cloneElement(child, {
      ...child.props,
      ...sharedProps,
      className:
        [child.props.className, props.className].filter(Boolean).join(' ') ||
        undefined,
      style: { ...OVERFLOW[orientation], ...child.props.style, ...style },
      ref: childRef,
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
