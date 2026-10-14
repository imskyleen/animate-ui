'use client';

import * as React from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import { AnimatePresence } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import type { AnchoredAnimationProps } from '../../../internal/anchored';
import {
  FollowCursorProvider,
  useFollowCursorHandler,
  type FollowCursorProps,
} from '../../../internal/follow-cursor';
import {
  RadixAnchoredContent,
  useRadixOpenState,
} from '../popover/radix-anchored';

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'HoverCard.Root',
);
const PortalForceMountContext = React.createContext(false);

type HoverCardProps = HoverCardPrimitive.HoverCardProps & FollowCursorProps;
type HoverCardTriggerProps = HoverCardPrimitive.HoverCardTriggerProps;
type HoverCardPortalProps = HoverCardPrimitive.HoverCardPortalProps;
type HoverCardContentProps = HoverCardPrimitive.HoverCardContentProps &
  AnchoredAnimationProps;
type HoverCardArrowProps = HoverCardPrimitive.HoverCardArrowProps;

function Root({
  open: openProp,
  defaultOpen,
  onOpenChange,
  followCursor,
  followCursorSpringOptions,
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
        <FollowCursorProvider
          followCursor={followCursor}
          followCursorSpringOptions={followCursorSpringOptions}
        >
          <HoverCardPrimitive.Root
            {...props}
            open={open}
            onOpenChange={setOpen}
          />
        </FollowCursorProvider>
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

function Trigger({
  onMouseMove,
  ...props
}: HoverCardTriggerProps & React.RefAttributes<HTMLAnchorElement>) {
  return (
    <HoverCardPrimitive.Trigger
      {...props}
      onMouseMove={useFollowCursorHandler(onMouseMove)}
    />
  );
}

function Portal({ forceMount, ...props }: HoverCardPortalProps) {
  return (
    <PortalForceMountContext value={Boolean(forceMount)}>
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

Trigger.displayName = 'HoverCardTrigger';
Content.displayName = 'HoverCardContent';

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
