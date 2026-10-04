'use client';

import * as React from 'react';
import { motion } from 'motion/react';

import {
  asMotion,
  useAnchoredMotion,
  type AnchoredAnimationProps,
} from '../../../internal/anchored';

// The Radix side of Popover, HoverCard and Tooltip: the Root mirrors the open
// state (Radix keeps it private) and each Content gates itself with
// AnimatePresence, so it works with or without a Portal around it.

/**
 * Open state of a Radix Root, controlled or not. It's handed back to Radix as
 * `open`, so there is one source of truth.
 */
function useRadixOpenState(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const controlled = openProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = controlled ? openProp : uncontrolled;

  const setOpen = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    onOpenChange?.(next);
  };

  return [open, setOpen] as const;
}

type RadixAnchoredContentProps = AnchoredAnimationProps & {
  /** Radix's Content part. */
  component: React.ElementType;
  /** The props the user gave to Content (minus forceMount). */
  contentProps: {
    children?: React.ReactNode;
    asChild?: boolean;
    style?: React.CSSProperties;
  } & Record<string, unknown>;
  open: boolean;
  keepMounted: boolean;
  /** Radix's transform-origin variable for this content. */
  origin: string;
};

/**
 * The animated Content, rendered as AnimatePresence's child. Radix's props
 * (className, style, data-state, data-side, ids, handlers) land on the motion
 * element through `asChild`: it is the element shadcn/ui styles.
 */
function RadixAnchoredContent({
  component: Content,
  contentProps: { children, asChild, style, ...contentProps },
  open,
  keepMounted,
  origin,
  transition,
  exitTransition,
}: RadixAnchoredContentProps) {
  const motionProps = useAnchoredMotion({
    open,
    keepMounted,
    transition,
    exitTransition,
  });
  const elementProps = {
    ...motionProps,
    // Kept mounted while closed: out of reach (tab order, a11y tree).
    inert: keepMounted && !open ? true : undefined,
  };

  return (
    <Content
      {...contentProps}
      // Grows from the trigger. Before the user's style, so it can be changed.
      style={{ transformOrigin: origin, ...style }}
      forceMount
      asChild
    >
      {asChild && React.isValidElement(children) ? (
        asMotion(children, elementProps)
      ) : (
        <motion.div {...elementProps}>{children}</motion.div>
      )}
    </Content>
  );
}

export { useRadixOpenState, RadixAnchoredContent };
