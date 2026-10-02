'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type HTMLMotionProps,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  spring,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';
import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';

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

function toTransform([x, y]: number[]) {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
}

function Cursor({ ref, asChild = false, style, ...props }: CursorProps) {
  const { cursorX, cursorY, active, containerRef, cursorRef, global } =
    useCursor();
  React.useImperativeHandle(ref, () => cursorRef.current as HTMLDivElement);

  // Follows the pointer through a motion value: no re-render per move.
  const transform = useTransform([cursorX, cursorY], toTransform);

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
            transform,
            pointerEvents: 'none',
            zIndex: 9999,
            position: global ? 'fixed' : 'absolute',
            top: 0,
            left: 0,
            ...style,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: motionTransition.exit }}
          transition={motionTransition.tooltip}
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

const DEFAULT_FOLLOW_TRANSITION: SpringOptions = {
  duration: spring.default.duration,
  bounce: spring.default.bounce,
};

function CursorFollow({
  ref,
  asChild = false,
  side = 'bottom',
  sideOffset = 0,
  align = 'end',
  alignOffset = 0,
  style,
  transition = DEFAULT_FOLLOW_TRANSITION,
  ...props
}: CursorFollowProps) {
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

  const springTransform = useTransform([springX, springY], toTransform);
  const directTransform = useTransform([x, y], toTransform);

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

  React.useEffect(() => {
    if (!active) return;

    const update = () => {
      const offset = calculateOffset();
      const cursorRect = cursorRef.current?.getBoundingClientRect();
      const cursorWidth = cursorRect?.width ?? 20;
      const cursorHeight = cursorRect?.height ?? 20;

      x.set(cursorX.get() - offset.x + cursorWidth / 2);
      y.set(cursorY.get() - offset.y + cursorHeight / 2);
    };

    // Appear at the pointer instead of springing in from the last position.
    update();
    springX.jump(x.get());
    springY.jump(y.get());

    const unsubscribeX = cursorX.on('change', update);
    const unsubscribeY = cursorY.on('change', update);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [
    active,
    calculateOffset,
    cursorRef,
    cursorX,
    cursorY,
    x,
    y,
    springX,
    springY,
  ]);

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
            transform: reduce ? directTransform : springTransform,
            pointerEvents: 'none',
            zIndex: 9998,
            position: global ? 'fixed' : 'absolute',
            top: 0,
            left: 0,
            ...style,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: motionTransition.exit }}
          transition={motionTransition.tooltip}
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
