'use client';

import * as React from 'react';
import {
  motion,
  spring,
  useMotionValue,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { animate as animateStyles } from 'motion/mini';
import { useControlledState } from '../../utils/use-controlled-state';
import { getStrictContext } from '../../utils/strict-context';
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from '../effects/highlight';
import { Slot, type WithAsChild } from '../slot';
import { SCALE_SPRING, TAP_SCALE } from '../buttons/_button';

const HIGHLIGHT_TRANSITION: Transition = motionTokens.spring.selection;
const SCROLL_TRANSITION: Transition = motionTokens.spring.slide;
const FADE_TRANSITION: Transition = motionTokens.transition.fade;
const LABEL_TRANSITION: Transition = motionTokens.spring.selection;
const INSTANT: Transition = { duration: 0 };

// Scrolled less than this, the bar stays as it is.
const SCROLL_THRESHOLD = 6;
// Gap kept between the hidden bar and the edge it slides past.
const HIDDEN_GAP = 8;

type BottomNavigationScrollBehavior = 'none' | 'hide' | 'minimize';

type BottomNavigationContextType = {
  activeValue: string | undefined;
  handleValueChange: (value: string) => void;
  minimized: boolean;
  scrollBehavior: BottomNavigationScrollBehavior;
  scrollTransition: Transition;
};

const [BottomNavigationProvider, useBottomNavigation] =
  getStrictContext<BottomNavigationContextType>('BottomNavigationContext');

const [BottomNavigationItemProvider, useBottomNavigationItem] =
  getStrictContext<{ isActive: boolean }>('BottomNavigationItemContext');

type ScrollTarget = React.RefObject<HTMLElement | null>;

type BottomNavigationProps = Omit<
  HTMLMotionProps<'nav'>,
  'onValueChange' | 'defaultValue'
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  scrollBehavior?: BottomNavigationScrollBehavior;
  scrollContainer?: ScrollTarget;
  transition?: Transition;
};

function BottomNavigation(props: BottomNavigationProps) {
  return (
    <ReducedMotionConfig>
      <BottomNavigationRoot {...props} />
    </ReducedMotionConfig>
  );
}

function scrollTopOf(target: HTMLElement | Window) {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

const ACCESSORY = '[data-slot="bottom-navigation-accessory"]';

function keyboardFocus(target: EventTarget) {
  return target instanceof Element && target.matches(':focus-visible');
}

function inAccessory(target: EventTarget) {
  return target instanceof Element && !!target.closest(ACCESSORY);
}

function BottomNavigationRoot({
  ref,
  value,
  defaultValue,
  onValueChange,
  scrollBehavior = 'none',
  scrollContainer,
  transition,
  onFocusCapture,
  onClick,
  style,
  ...props
}: BottomNavigationProps) {
  const [activeValue, setActiveValue] = useControlledState<string | undefined>({
    value,
    defaultValue,
    onChange: onValueChange as (value: string | undefined) => void,
  });
  const reduce = useShouldReduceMotion();
  const slide = useTempoTransition(SCROLL_TRANSITION);
  const fade = useTempoTransition(FADE_TRANSITION);
  const scrollTransition = transition ?? (reduce ? INSTANT : slide);

  const localRef = React.useRef<HTMLElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLElement);

  const [collapsed, setCollapsed] = React.useState(false);
  const hidden = collapsed && scrollBehavior === 'hide';
  const minimized = collapsed && scrollBehavior === 'minimize';
  const y = useMotionValue(0);
  const [offset, setOffset] = React.useState(0);

  const collapse = React.useCallback(() => {
    const nav = localRef.current;
    if (!nav) return;
    if (scrollBehavior === 'hide') {
      const rect = nav.getBoundingClientRect();
      const edge =
        scrollContainer?.current?.getBoundingClientRect().bottom ??
        window.innerHeight;
      setOffset(edge - (rect.top - y.get()) + HIDDEN_GAP);
    }
    setCollapsed(true);
  }, [scrollBehavior, scrollContainer, y]);

  React.useEffect(() => {
    setCollapsed(false);
    if (scrollBehavior === 'none') return;
    const target: HTMLElement | Window = scrollContainer?.current ?? window;
    let last = scrollTopOf(target);
    const onScroll = () => {
      const top = scrollTopOf(target);
      const delta = top - last;
      if (top <= 0) {
        setCollapsed(false);
        last = top;
        return;
      }
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;
      if (delta > 0) collapse();
      else setCollapsed(false);
      last = top;
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [scrollBehavior, scrollContainer, collapse]);

  const handleValueChange = React.useCallback(
    (next: string) => {
      setCollapsed(false);
      setActiveValue(next);
    },
    [setActiveValue],
  );

  const context = React.useMemo(
    () => ({
      activeValue,
      handleValueChange,
      minimized,
      scrollBehavior,
      scrollTransition,
    }),
    [
      activeValue,
      handleValueChange,
      minimized,
      scrollBehavior,
      scrollTransition,
    ],
  );

  return (
    <BottomNavigationProvider value={context}>
      <motion.nav
        ref={localRef}
        data-slot="bottom-navigation"
        data-hidden={hidden ? '' : undefined}
        data-minimized={minimized ? '' : undefined}
        style={{
          y: reduce ? 0 : y,
          pointerEvents: hidden ? 'none' : undefined,
          ...style,
        }}
        initial={false}
        animate={
          reduce
            ? { opacity: hidden ? 0 : 1 }
            : { y: hidden ? offset : 0, opacity: 1 }
        }
        transition={reduce ? (transition ?? fade) : scrollTransition}
        onFocusCapture={(event: React.FocusEvent<HTMLElement>) => {
          onFocusCapture?.(event);
          // A press focuses too: its click grows the bar, with its selection.
          if (keyboardFocus(event.target) && !inAccessory(event.target))
            setCollapsed(false);
        }}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (!inAccessory(event.target)) setCollapsed(false);
        }}
        {...props}
      />
    </BottomNavigationProvider>
  );
}

type BottomNavigationHighlightProps = Omit<
  HighlightProps,
  'controlledItems' | 'value'
>;

function BottomNavigationHighlight({
  transition,
  ...props
}: BottomNavigationHighlightProps) {
  const { activeValue } = useBottomNavigation();
  return (
    <Highlight
      data-slot="bottom-navigation-highlight"
      controlledItems
      value={activeValue ?? null}
      transition={transition ?? HIGHLIGHT_TRANSITION}
      click={false}
      {...props}
    />
  );
}

type BottomNavigationHighlightItemProps = HighlightItemProps & {
  value: string;
};

function BottomNavigationHighlightItem(
  props: BottomNavigationHighlightItemProps,
) {
  return (
    <HighlightItem data-slot="bottom-navigation-highlight-item" {...props} />
  );
}

type BottomNavigationItemProps = WithAsChild<
  HTMLMotionProps<'a'> & {
    value: string;
    tapScale?: number;
  }
>;

const BOX = [
  'width',
  'height',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
] as const;

type Size = number[];

const sizeOf = (el: HTMLElement): Size => {
  const style = getComputedStyle(el);
  return BOX.map((key) => parseFloat(style[key]));
};

const clearBox = (el: HTMLElement) => {
  for (const key of BOX) el.style[key] = '';
};

const LABEL = '[data-slot="bottom-navigation-label"]';

// The element's size once the labels in it have opened or folded.
// Under its icon, a label folds its height; beside it, its width.
const isBelow = (label: Element) =>
  !!label.parentElement &&
  getComputedStyle(label.parentElement).flexDirection.startsWith('column');

const settledSizeOf = (el: HTMLElement): Size => {
  const labels = [...el.querySelectorAll<HTMLElement>(LABEL)];
  const saved = labels.map(({ style }) => [style.width, style.height] as const);
  for (const label of labels) {
    const folded = 'folded' in label.dataset ? '0px' : 'auto';
    label.style.width = isBelow(label) ? 'auto' : folded;
    label.style.height = isBelow(label) ? folded : 'auto';
  }
  const size = sizeOf(el);
  labels.forEach(({ style }, index) => {
    [style.width, style.height] = saved[index]!;
  });
  return size;
};

// When the bar minimizes or grows back, the element eases from its last size
// and padding to the ones its CSS gives it in the new state.
function useMorph(
  element: React.RefObject<HTMLElement | null>,
  minimized: boolean,
  transition: Transition,
  selected?: boolean,
) {
  const reduce = useShouldReduceMotion();
  const sizeRef = React.useRef<Size | null>(null);
  const controlsRef = React.useRef<ReturnType<typeof animateStyles> | null>(
    null,
  );
  const minimizedRef = React.useRef(minimized);
  const selectedRef = React.useRef(selected);

  React.useLayoutEffect(() => {
    const el = element.current;
    if (!el) return;
    sizeRef.current = sizeOf(el);
    const observer = new ResizeObserver(() => {
      if (!controlsRef.current) sizeRef.current = sizeOf(el);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [element]);

  React.useLayoutEffect(() => {
    const el = element.current;
    const reselected = selected !== selectedRef.current;
    selectedRef.current = selected;
    // Selected while it eases, it heads for its new size instead.
    if (
      !el ||
      (minimized === minimizedRef.current &&
        !(reselected && controlsRef.current))
    )
      return;
    minimizedRef.current = minimized;
    const from = controlsRef.current ? sizeOf(el) : sizeRef.current;
    controlsRef.current?.stop();
    controlsRef.current = null;
    clearBox(el);
    const to = settledSizeOf(el);
    sizeRef.current = to;
    if (reduce || !from || from.every((value, index) => value === to[index]))
      return;
    const controls = animateStyles(
      el,
      {
        ...Object.fromEntries(
          BOX.map((key, index) => [
            key,
            [`${from[index]}px`, `${to[index]}px`],
          ]),
        ),
      },
      transition.type === 'spring'
        ? { ...transition, type: spring }
        : transition,
    );
    controlsRef.current = controls;
    controls.then(() => {
      if (controlsRef.current !== controls) return;
      controlsRef.current = null;
      clearBox(el);
    });
  }, [element, minimized, selected, reduce, transition]);
}

function BottomNavigationItem({
  ref,
  value,
  tapScale = TAP_SCALE,
  asChild = false,
  transition,
  onClick,
  ...props
}: BottomNavigationItemProps) {
  const { activeValue, handleValueChange, minimized, scrollTransition } =
    useBottomNavigation();
  const reduce = useShouldReduceMotion();
  const press = useTempoTransition(SCALE_SPRING);
  const isActive = activeValue === value;
  const Component = asChild ? Slot : motion.a;

  const localRef = React.useRef<HTMLAnchorElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLAnchorElement);
  useMorph(localRef, minimized, scrollTransition, isActive);

  return (
    <BottomNavigationItemProvider value={{ isActive }}>
      <Component
        ref={localRef}
        data-slot="bottom-navigation-item"
        data-state={isActive ? 'active' : 'inactive'}
        data-minimized={minimized ? '' : undefined}
        aria-current={isActive ? 'page' : undefined}
        initial={reduce ? undefined : { transform: 'scale(1)' }}
        whileTap={reduce ? undefined : { transform: `scale(${tapScale})` }}
        transition={transition ?? press}
        {...props}
        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) handleValueChange(value);
        }}
      />
    </BottomNavigationItemProvider>
  );
}

type BottomNavigationLabelShow = 'always' | 'active';

type BottomNavigationLabelProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  children?: React.ReactNode;
  show?: BottomNavigationLabelShow;
};

// Opens out of a blur and folds away with its room: when the bar minimizes,
// and with `show="active"`, when its item isn't selected.
function BottomNavigationLabel({
  ref,
  show = 'always',
  transition,
  className,
  style,
  children,
  ...props
}: BottomNavigationLabelProps) {
  const { minimized, scrollTransition } = useBottomNavigation();
  const { isActive } = useBottomNavigationItem();
  const reduce = useShouldReduceMotion();
  const fade = useTempoTransition(FADE_TRANSITION);
  const select = useTempoTransition(LABEL_TRANSITION);
  const folded = minimized || (show === 'active' && !isActive);
  const localRef = React.useRef<HTMLSpanElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);
  const [below, setBelow] = React.useState(false);
  React.useLayoutEffect(() => {
    if (localRef.current) setBelow(isBelow(localRef.current));
  }, []);
  // Opened or folded by the bar, it moves with the items' sizes.
  const minimizedRef = React.useRef(minimized);
  const byBar = minimizedRef.current !== minimized || show === 'always';
  React.useLayoutEffect(() => {
    minimizedRef.current = minimized;
  }, [minimized]);
  const size = transition ?? (byBar ? scrollTransition : select);
  // Beside its icon, it fades with its width; below it, out of the way first.
  const look =
    show === 'active'
      ? size
      : folded
        ? { ...fade, duration: (fade.duration ?? 0.2) / 2 }
        : fade;

  return (
    <motion.span
      ref={localRef}
      data-slot="bottom-navigation-label"
      data-folded={folded ? '' : undefined}
      style={{
        display: 'inline-flex',
        justifyContent: below ? 'center' : 'flex-start',
        flexShrink: 0,
        overflow: 'clip',
        whiteSpace: 'nowrap',
        ...style,
      }}
      initial={false}
      animate={
        folded
          ? {
              width: below ? 'auto' : 0,
              height: below ? 0 : 'auto',
              opacity: 0,
              filter: 'blur(4px)',
            }
          : { width: 'auto', height: 'auto', opacity: 1, filter: 'blur(0px)' }
      }
      transition={reduce ? INSTANT : { ...size, opacity: look, filter: look }}
      {...props}
    >
      <span className={className} style={{ display: 'inline-flex' }}>
        {children}
      </span>
    </motion.span>
  );
}

type BottomNavigationAccessoryProps = HTMLMotionProps<'div'>;

function BottomNavigationAccessory({
  ref,
  ...props
}: BottomNavigationAccessoryProps) {
  const { minimized, scrollTransition } = useBottomNavigation();
  const localRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);
  useMorph(localRef, minimized, scrollTransition);

  return (
    <motion.div
      ref={localRef}
      data-slot="bottom-navigation-accessory"
      data-minimized={minimized ? '' : undefined}
      {...props}
    />
  );
}

export {
  BottomNavigation,
  BottomNavigationHighlight,
  BottomNavigationHighlightItem,
  BottomNavigationItem,
  BottomNavigationLabel,
  BottomNavigationAccessory,
  useBottomNavigation,
  type BottomNavigationProps,
  type BottomNavigationLabelProps,
  type BottomNavigationLabelShow,
  type BottomNavigationAccessoryProps,
  type BottomNavigationScrollBehavior,
  type BottomNavigationHighlightProps,
  type BottomNavigationHighlightItemProps,
  type BottomNavigationItemProps,
};
