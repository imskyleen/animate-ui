'use client';

import * as React from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import { AnimatePresence } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import type { AnchoredAnimationProps } from '../../../internal/anchored';
import {
  RadixAnchoredContent,
  useRadixOpenState,
} from '../popover/radix-anchored';

// Same API as Radix's HoverCard. The Content grows from half its size and
// fades in from the trigger on a spring, and shrinks back the same way
// (Animate UI v1's HoverCard). Radix ignores touch pointers, so hover never
// sticks on touch screens.

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'HoverCard.Root',
);
// The `forceMount` of the closest Portal: it keeps the Content mounted too.
const PortalForceMountContext = React.createContext(false);

type HoverCardProps = HoverCardPrimitive.HoverCardProps;
type HoverCardTriggerProps = HoverCardPrimitive.HoverCardTriggerProps;
type HoverCardPortalProps = HoverCardPrimitive.HoverCardPortalProps;
type HoverCardContentProps = HoverCardPrimitive.HoverCardContentProps &
  AnchoredAnimationProps;
type HoverCardArrowProps = HoverCardPrimitive.HoverCardArrowProps;

function Root({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: HoverCardProps) {
  const [open, setOpen] = useRadixOpenState(
    openProp,
    defaultOpen,
    onOpenChange,
  );

  return (
    <OpenProvider value={{ open }}>
      <ReducedMotionConfig>
        <HoverCardPrimitive.Root
          {...props}
          open={open}
          onOpenChange={setOpen}
        />
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

const Trigger = HoverCardPrimitive.Trigger;

function Portal({ forceMount, ...props }: HoverCardPortalProps) {
  return (
    <PortalForceMountContext value={Boolean(forceMount)}>
      {/* Always mounted: the Content decides when it leaves the DOM, after
          its exit. Closed, it renders nothing, so neither does the portal. */}
      <HoverCardPrimitive.Portal {...props} forceMount />
    </PortalForceMountContext>
  );
}

function Content({
  forceMount,
  transition,
  exitTransition,
  ...props
}: HoverCardContentProps & React.RefAttributes<HTMLDivElement>) {
  const { open } = useOpen();
  const keepMounted = Boolean(forceMount) || React.use(PortalForceMountContext);

  return (
    <AnimatePresence>
      {(open || keepMounted) && (
        <RadixAnchoredContent
          key="content"
          component={HoverCardPrimitive.Content}
          contentProps={props}
          open={open}
          keepMounted={keepMounted}
          origin="var(--radix-hover-card-content-transform-origin)"
          transition={transition}
          exitTransition={exitTransition}
        />
      )}
    </AnimatePresence>
  );
}

const Arrow = HoverCardPrimitive.Arrow;

const createHoverCardScope: typeof HoverCardPrimitive.createHoverCardScope =
  HoverCardPrimitive.createHoverCardScope;

export {
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
  Root as HoverCard,
  Trigger as HoverCardTrigger,
  Portal as HoverCardPortal,
  Content as HoverCardContent,
  Arrow as HoverCardArrow,
  createHoverCardScope,
  type HoverCardProps,
  type HoverCardTriggerProps,
  type HoverCardPortalProps,
  type HoverCardContentProps,
  type HoverCardArrowProps,
};
