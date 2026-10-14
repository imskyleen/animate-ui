'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
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
  'Tooltip.Root',
);
const PortalForceMountContext = React.createContext(false);

type TooltipProviderProps = TooltipPrimitive.TooltipProviderProps;
type TooltipProps = TooltipPrimitive.TooltipProps & FollowCursorProps;
type TooltipTriggerProps = TooltipPrimitive.TooltipTriggerProps;
type TooltipPortalProps = TooltipPrimitive.TooltipPortalProps;
type TooltipContentProps = TooltipPrimitive.TooltipContentProps &
  AnchoredAnimationProps;
type TooltipArrowProps = TooltipPrimitive.TooltipArrowProps;

const Provider = TooltipPrimitive.Provider;

function Root({
  open: openProp,
  defaultOpen,
  onOpenChange,
  followCursor,
  followCursorSpringOptions,
  ...props
}: TooltipProps) {
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
          <TooltipPrimitive.Root
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
}: TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>) {
  return (
    <TooltipPrimitive.Trigger
      {...props}
      onMouseMove={useFollowCursorHandler(onMouseMove)}
    />
  );
}

function Portal({ forceMount, ...props }: TooltipPortalProps) {
  return (
    <PortalForceMountContext value={Boolean(forceMount)}>
      <TooltipPrimitive.Portal {...props} forceMount />
    </PortalForceMountContext>
  );
}

function Content({
  forceMount,
  transition,
  exitTransition,
  ...props
}: TooltipContentProps & React.RefAttributes<HTMLDivElement>) {
  const { open } = useOpen();
  const keepMounted = Boolean(forceMount) || React.use(PortalForceMountContext);

  return (
    <AnimatePresence>
      {(open || keepMounted) && (
        <RadixAnchoredContent
          key="content"
          component={TooltipPrimitive.Content}
          contentProps={props}
          open={open}
          keepMounted={keepMounted}
          origin="var(--radix-tooltip-content-transform-origin)"
          kind="tooltip"
          transition={transition}
          exitTransition={exitTransition}
        />
      )}
    </AnimatePresence>
  );
}

const Arrow = TooltipPrimitive.Arrow;

const createTooltipScope: typeof TooltipPrimitive.createTooltipScope =
  TooltipPrimitive.createTooltipScope;

Trigger.displayName = 'TooltipTrigger';
Content.displayName = 'TooltipContent';

export {
  Provider,
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
  Provider as TooltipProvider,
  Root as Tooltip,
  Trigger as TooltipTrigger,
  Portal as TooltipPortal,
  Content as TooltipContent,
  Arrow as TooltipArrow,
  createTooltipScope,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipPortalProps,
  type TooltipContentProps,
  type TooltipArrowProps,
};
