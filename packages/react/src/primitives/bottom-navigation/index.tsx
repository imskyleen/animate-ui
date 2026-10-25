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
          if (!inAccessory(event.target)) setCollapsed(false);
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

const FOLDED_SIZE = ['width', 'paddingLeft', 'paddingRight'] as const;

function useFold(
  element: React.RefObject<HTMLElement | null>,
  folded: boolean,
  transition: Transition,
) {
  const sizeRef = React.useRef<Record<string, number> | null>(null);
  const wasFoldedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const el = element.current;
    if (!el || folded === wasFoldedRef.current) return;
    wasFoldedRef.current = folded;
    if (folded && !el.style.width) {
      const style = getComputedStyle(el);
      sizeRef.current = {
        width: el.getBoundingClientRect().width,
        paddingLeft: parseFloat(style.paddingLeft),
        paddingRight: parseFloat(style.paddingRight),
      };
    }
    const target = sizeRef.current;
    if (!target) return;
    const px = (key: string) => (folded ? '0px' : `${target[key]}px`);
    const controls = animateStyles(
      el,
      {
        width: px('width'),
        paddingLeft: px('paddingLeft'),
        paddingRight: px('paddingRight'),
        opacity: folded ? 0 : 1,
        filter: folded ? 'blur(4px)' : 'blur(0px)',
      },
      transition.type === 'spring'
        ? { ...transition, type: spring }
        : transition,
    );
    if (!folded)
      controls.then(() => {
        if (wasFoldedRef.current) return;
        for (const key of FOLDED_SIZE) el.style[key] = '';
      });
  }, [element, folded, transition]);
}

function BottomNavigationItem({
  ref,
  value,
  tapScale = TAP_SCALE,
  asChild = false,
  transition,
  onClick,
  style,
  ...props
}: BottomNavigationItemProps) {
  const {
    activeValue,
    handleValueChange,
    minimized,
    scrollBehavior,
    scrollTransition,
  } = useBottomNavigation();
  const reduce = useShouldReduceMotion();
  const press = useTempoTransition(SCALE_SPRING);
  const isActive = activeValue === value;
  const folded = minimized && !isActive;
  const Component = asChild ? Slot : motion.a;

  const localRef = React.useRef<HTMLAnchorElement | null>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLAnchorElement);
  useFold(localRef, folded, scrollTransition);

  return (
    <BottomNavigationItemProvider value={{ isActive }}>
      <Component
        ref={localRef}
        data-slot="bottom-navigation-item"
        data-state={isActive ? 'active' : 'inactive'}
        aria-current={isActive ? 'page' : undefined}
        inert={folded || undefined}
        style={
          scrollBehavior === 'minimize'
            ? { overflow: 'hidden', ...style }
            : style
        }
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

type BottomNavigationLabelProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  children?: React.ReactNode;
};

// Opens to its text's width out of a blur; closed, it takes no room.
function BottomNavigationLabel({
  transition,
  className,
  style,
  children,
  ...props
}: BottomNavigationLabelProps) {
  const { isActive } = useBottomNavigationItem();
  const slide = useTempoTransition(LABEL_TRANSITION);

  return (
    <motion.span
      data-slot="bottom-navigation-label"
      style={{
        display: 'inline-flex',
        flexShrink: 0,
        overflow: 'clip',
        whiteSpace: 'nowrap',
        ...style,
      }}
      initial={false}
      animate={
        isActive
          ? { width: 'auto', opacity: 1, filter: 'blur(0px)' }
          : { width: 0, opacity: 0, filter: 'blur(4px)' }
      }
      transition={transition ?? slide}
      {...props}
    >
      <span className={className} style={{ display: 'inline-flex' }}>
        {children}
      </span>
    </motion.span>
  );
}

type BottomNavigationAccessoryProps = HTMLMotionProps<'div'>;

function BottomNavigationAccessory(props: BottomNavigationAccessoryProps) {
  return <motion.div data-slot="bottom-navigation-accessory" {...props} />;
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
  type BottomNavigationAccessoryProps,
  type BottomNavigationScrollBehavior,
  type BottomNavigationHighlightProps,
  type BottomNavigationHighlightItemProps,
  type BottomNavigationItemProps,
};
