'use client';

import { ReducedMotionConfig } from '@animate-ui/react/utils/motion';
import { cn } from 'cn';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import {
  createContext,
  use,
  useId,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';

// The sidebar's and the TOC's lists: a vertical line, and two bars that glide
// from item to item (layoutId): the active one, and the hovered one.

const indicatorTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
} as const;

const labelTransition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
} as const;

const NavContext = createContext<{
  hovered: string | null;
  setHovered: (id: string | null) => void;
}>({ hovered: null, setHovered: () => {} });

/** One list: its bars only glide between its own items. */
export function AnimatedNav({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <ReducedMotionConfig>
      <LayoutGroup id={useId()}>
        <NavContext value={{ hovered, setHovered }}>{children}</NavContext>
      </LayoutGroup>
    </ReducedMotionConfig>
  );
}

/** Hover state of an item: mouse only, touch doesn't leave a bar behind. */
export function useNavHover(id: string) {
  const { hovered, setHovered } = use(NavContext);
  return {
    hovered: hovered === id,
    hoverProps: {
      onPointerEnter: (event: PointerEvent) => {
        if (event.pointerType === 'mouse') setHovered(id);
      },
      onPointerLeave: () => setHovered(null),
    },
  };
}

/** The line, the bars and the label of an item, inside its link. */
export function NavItemContent({
  active,
  hovered,
  depth = 0,
  children,
}: {
  active: boolean;
  hovered: boolean;
  /** TOC: nested headings are indented. */
  depth?: number;
  children: ReactNode;
}) {
  return (
    <>
      <span className="absolute inset-y-0 left-[9px] w-px bg-border" />
      <AnimatePresence initial={false}>
        {active && (
          <motion.span
            layoutId="active-indicator"
            className="pointer-events-none absolute top-1/2 left-[8px] z-11 h-[56%] w-[3px] -translate-y-1/2 rounded-full bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={indicatorTransition}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {hovered && (
          <motion.span
            layoutId="hover-indicator"
            className="pointer-events-none absolute top-1/2 left-[8px] z-10 h-[56%] w-[3px] -translate-y-1/2 rounded-full bg-neutral-300 dark:bg-neutral-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={indicatorTransition}
          />
        )}
      </AnimatePresence>
      <motion.span
        className={cn(
          'w-full pl-3 text-sm text-neutral-700 transition-colors dark:text-neutral-200',
          (active || hovered) && 'text-black dark:text-white',
        )}
        style={{ paddingInlineStart: 12 + depth * 12 }}
        animate={{ x: active || hovered ? 3 : 0 }}
        transition={labelTransition}
      >
        {children}
      </motion.span>
    </>
  );
}
