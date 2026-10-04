'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  cancelFrame,
  frame,
  type HTMLMotionProps,
  type MotionValue,
  type SpringOptions,
  type Transition,
} from 'motion/react';

import { getStrictContext } from '../../utils/strict-context';
import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../utils/motion';
import { Slot, type WithAsChild } from '../slot';

// The cursor and its follower pop in and out with a scale and a fade, on
// Motion's default transitions for those values (written out so the tempo
// applies): `scale` on a spring, critically damped on the way out so it
// doesn't overshoot past 0, and `opacity` on a 300ms ease.
const OPACITY_TRANSITION: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.35, 1],
};
const ENTER_TRANSITION: Transition = {
  scale: { type: 'spring', stiffness: 550, damping: 30, restSpeed: 10 },
  opacity: OPACITY_TRANSITION,
};
const EXIT_TRANSITION: Transition = {
  scale: {
    type: 'spring',
    stiffness: 550,
    damping: 2 * Math.sqrt(550),
    restSpeed: 10,
  },
  opacity: OPACITY_TRANSITION,
};
const FOLLOW_SPRING: SpringOptions = { stiffness: 500, damping: 50, bounce: 0 };

type CursorContextType = {
  /**
   * Snapshot of the pointer position when read. Pointer moves don't
   * re-render: subscribe to `cursorX` / `cursorY` to follow them.
   */
  cursorPos: { x: number; y: number };
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  active: boolean;
  global: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  cursorRef: React.RefObject<HTMLDivElement | null>;
};

const [LocalCursorProvider, useCursor] =
  getStrictContext<CursorContextType>('CursorContext');

type CursorProviderProps = {
  children: React.ReactNode;
  global?: boolean;
};

function CursorProvider({ children, global = false }: CursorProviderProps) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [activeState, setActiveState] = React.useState(false);
  const active = activeState;
  const activeRef = React.useRef(false);

  // Pointer moves only re-render when the cursor shows or hides.
  const setActive = React.useCallback((next: boolean) => {
    if (activeRef.current === next) return;
    activeRef.current = next;
    setActiveState(next);
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const id = '__cursor_none_style__';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .animate-ui-cursor-none, .animate-ui-cursor-none * { cursor: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  React.useEffect(() => {
    let removeListeners: () => void;

    if (global) {
      const handlePointerMove = (e: PointerEvent) => {
        // A custom cursor only makes sense for pointers that hover.
        if (e.pointerType === 'touch') return;
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        setActive(true);
      };

      const handlePointerOut = (e: PointerEvent | MouseEvent) => {
        if (e instanceof PointerEvent && e.relatedTarget === null) {
          setActive(false);
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') setActive(false);
      };

      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
      window.addEventListener('pointerout', handlePointerOut, {
        passive: true,
      });
      window.addEventListener('mouseout', handlePointerOut, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityChange);

      removeListeners = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerout', handlePointerOut);
        window.removeEventListener('mouseout', handlePointerOut);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      };
    } else {
      if (!containerRef.current) return;

      const parent = containerRef.current.parentElement;
      if (!parent) return;

      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }

      const handlePointerMove = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        const rect = parent.getBoundingClientRect();
        cursorX.set(e.clientX - rect.left);
        cursorY.set(e.clientY - rect.top);
        setActive(true);
      };

      const handlePointerOut = (e: PointerEvent | MouseEvent) => {
        if (
          e.relatedTarget === null ||
          !(parent as Node).contains(e.relatedTarget as Node)
        ) {
          setActive(false);
        }
      };

      parent.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
      parent.addEventListener('pointerout', handlePointerOut, {
        passive: true,
      });
      parent.addEventListener('mouseout', handlePointerOut, { passive: true });

      removeListeners = () => {
        parent.removeEventListener('pointermove', handlePointerMove);
        parent.removeEventListener('pointerout', handlePointerOut);
        parent.removeEventListener('mouseout', handlePointerOut);
      };
    }

    return removeListeners;
  }, [global, cursorX, cursorY, setActive]);

  const value = React.useMemo<CursorContextType>(
    () => ({
      get cursorPos() {
        return { x: cursorX.get(), y: cursorY.get() };
      },
      cursorX,
      cursorY,
      active,
      global,
      containerRef,
      cursorRef,
    }),
    [cursorX, cursorY, active, global],
  );

  return (
    <LocalCursorProvider value={value}>
      <ReducedMotionConfig>{children}</ReducedMotionConfig>
    </LocalCursorProvider>
  );
}

type CursorContainerProps = WithAsChild<HTMLMotionProps<'div'>>;

function CursorContainer({
  ref,
  asChild = false,
  ...props
}: CursorContainerProps) {
  const { containerRef, global, active } = useCursor();
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const Component = asChild ? Slot : motion.div;

  return (
    <Component
      ref={containerRef}
      data-slot="cursor-container"
      data-global={global}
      data-active={active}
      {...props}
    />
  );
}

type CursorProps = WithAsChild<
  HTMLMotionProps<'div'> & {
    children: React.ReactNode;
  }
>;

function Cursor({
  ref,
  asChild = false,
  style,
  transition,
  ...props
}: CursorProps) {
  const { cursorX, cursorY, active, containerRef, cursorRef, global } =
    useCursor();
  React.useImperativeHandle(ref, () => cursorRef.current as HTMLDivElement);

  const enterTransition = useTempoTransition(ENTER_TRANSITION);
  const exitTransition = useTempoTransition(EXIT_TRANSITION);

  // Copies of the pointer position: a re-mount resetting the element's own
  // values (Strict Mode, Suspense) can't rewind the provider's.
  const positionX = useTransform(cursorX, (value) => value);
  const positionY = useTransform(cursorY, (value) => value);

  React.useEffect(() => {
    const target = global
      ? document.documentElement
      : containerRef.current?.parentElement;

    if (!target) return;

    if (active) {
      target.classList.add('animate-ui-cursor-none');
    } else {
      target.classList.remove('animate-ui-cursor-none');
    }

    return () => {
      target.classList.remove('animate-ui-cursor-none');
    };
  }, [active, global, containerRef]);

  const Component = asChild ? Slot : motion.div;

  return (
    <AnimatePresence>
      {active && (
        <Component
          ref={cursorRef}
          data-slot="cursor"
          data-global={global}
          data-active={active}
          style={{
            pointerEvents: 'none',
            zIndex: 9999,
            position: global ? 'fixed' : 'absolute',
            top: 0,
            left: 0,
            // Its top-left corner sits on the pointer. Follows it through
            // motion values: no re-render per move.
            x: positionX,
            y: positionY,
            ...style,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{
            scale: 0,
            opacity: 0,
            ...(transition ? {} : { transition: exitTransition }),
          }}
          transition={transition ?? enterTransition}
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type CursorFollowSide = 'top' | 'right' | 'bottom' | 'left';
type CursorFollowAlign = 'start' | 'center' | 'end';

type CursorFollowProps = WithAsChild<
  Omit<HTMLMotionProps<'div'>, 'transition'> & {
    side?: CursorFollowSide;
    sideOffset?: number;
    align?: CursorFollowAlign;
    alignOffset?: number;
    transition?: SpringOptions;
    children: React.ReactNode;
  }
>;

function CursorFollow({
  ref,
  asChild = false,
  side = 'bottom',
  sideOffset = 0,
  align = 'end',
  alignOffset = 0,
  style,
  transition: transitionProp,
  ...props
}: CursorFollowProps) {
  const defaultTransition = useTempoTransition(FOLLOW_SPRING);
  const transition = transitionProp ?? defaultTransition;
  const enterTransition = useTempoTransition(ENTER_TRANSITION);
  const exitTransition = useTempoTransition(EXIT_TRANSITION);
  const { cursorX, cursorY, active, cursorRef, global } = useCursor();
  const reduce = useShouldReduceMotion();
  const cursorFollowRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(
    ref,
    () => cursorFollowRef.current as HTMLDivElement,
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, transition);
  const springY = useSpring(y, transition);
  // Copies position the element: a re-mount resetting the element's own
  // values (Strict Mode, Suspense) can't stop or rewind the spring.
  // Reduced motion: sticks to the pointer instead of trailing it.
  const positionX = useTransform(() => (reduce ? x : springX).get());
  const positionY = useTransform(() => (reduce ? y : springY).get());

  const calculateOffset = React.useCallback(() => {
    const rect = cursorFollowRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;

    let offsetX = 0;
    let offsetY = 0;

    switch (side) {
      case 'top':
        offsetY = height + sideOffset;
        switch (align) {
          case 'start':
            offsetX = width + alignOffset;
            break;
          case 'center':
            offsetX = width / 2;
            break;
          case 'end':
            offsetX = -alignOffset;
            break;
        }
        break;

      case 'bottom':
        offsetY = -sideOffset;
        switch (align) {
          case 'start':
            offsetX = width + alignOffset;
            break;
          case 'center':
            offsetX = width / 2;
            break;
          case 'end':
            offsetX = -alignOffset;
            break;
        }
        break;

      case 'left':
        offsetX = width + sideOffset;
        switch (align) {
          case 'start':
            offsetY = height + alignOffset;
            break;
          case 'center':
            offsetY = height / 2;
            break;
          case 'end':
            offsetY = -alignOffset;
            break;
        }
        break;

      case 'right':
        offsetX = -sideOffset;
        switch (align) {
          case 'start':
            offsetY = height + alignOffset;
            break;
          case 'center':
            offsetY = height / 2;
            break;
          case 'end':
            offsetY = -alignOffset;
            break;
        }
        break;
    }

    return { x: offsetX, y: offsetY };
  }, [side, align, sideOffset, alignOffset]);

  // The follower's target: the pointer, offset by `side`/`align` and by half
  // the cursor's current size (measured as rendered, mid-animation included).
  const update = React.useCallback(() => {
    const offset = calculateOffset();
    const cursorRect = cursorRef.current?.getBoundingClientRect();
    const cursorWidth = cursorRect?.width ?? 20;
    const cursorHeight = cursorRect?.height ?? 20;

    x.set(cursorX.get() - offset.x + cursorWidth / 2);
    y.set(cursorY.get() - offset.y + cursorHeight / 2);
  }, [calculateOffset, cursorRef, cursorX, cursorY, x, y]);

  // Also before the first move (from the 0,0 pointer and a 20px cursor): the
  // follower first springs in from there.
  React.useEffect(() => {
    update();
  }, [update]);

  React.useEffect(() => {
    if (!active) return;
    // On the frame after the cursor first renders, then on every move.
    frame.postRender(update);
    const unsubscribeX = cursorX.on('change', update);
    const unsubscribeY = cursorY.on('change', update);

    return () => {
      cancelFrame(update);
      unsubscribeX();
      unsubscribeY();
    };
  }, [active, update, cursorX, cursorY]);

  const Component = asChild ? Slot : motion.div;

  return (
    <AnimatePresence>
      {active && (
        <Component
          ref={cursorFollowRef}
          data-slot="cursor-follow"
          data-global={global}
          data-active={active}
          style={{
            pointerEvents: 'none',
            zIndex: 9998,
            position: global ? 'fixed' : 'absolute',
            top: 0,
            left: 0,
            x: positionX,
            y: positionY,
            ...style,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0, transition: exitTransition }}
          transition={enterTransition}
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

export {
  CursorProvider,
  Cursor,
  CursorContainer,
  CursorFollow,
  useCursor,
  type CursorProviderProps,
  type CursorProps,
  type CursorContainerProps,
  type CursorFollowProps,
  type CursorFollowAlign,
  type CursorFollowSide,
  type CursorContextType,
};
