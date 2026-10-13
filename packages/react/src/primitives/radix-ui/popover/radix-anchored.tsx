'use client';

import * as React from 'react';
import { motion } from 'motion/react';

import {
  asMotion,
  useAnchoredMotion,
  type AnchoredAnimationProps,
  type AnchoredKind,
} from '../../../internal/anchored';
import { useFollowCursorStyle } from '../../../internal/follow-cursor';

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
  component: React.ElementType;
  contentProps: {
    children?: React.ReactNode;
    asChild?: boolean;
    style?: React.CSSProperties;
  } & Record<string, unknown>;
  open: boolean;
  keepMounted: boolean;
  origin: string;
  kind?: AnchoredKind;
};

function RadixAnchoredContent({
  component: Content,
  contentProps: { children, asChild, style, ...contentProps },
  open,
  keepMounted,
  origin,
  kind,
  transition,
  exitTransition,
}: RadixAnchoredContentProps) {
  const motionProps = useAnchoredMotion({
    kind,
    open,
    keepMounted,
    transition,
    exitTransition,
  });
  const follow = useFollowCursorStyle();
  const elementProps = {
    ...motionProps,
    style: { ...motionProps.style, ...follow } as React.CSSProperties,
    inert: keepMounted && !open ? true : undefined,
  };

  return (
    <Content
      {...contentProps}
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
