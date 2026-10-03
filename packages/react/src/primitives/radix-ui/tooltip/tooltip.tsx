'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { AnimatePresence } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import type { AnchoredAnimationProps } from '../../../internal/anchored';
import {
  RadixAnchoredContent,
  useRadixOpenState,
} from '../popover/radix-anchored';

// Same API as Radix's Tooltip. The Content scales up from the trigger and
// fades in. A tooltip opened right after another one closed is warm: it
// appears at once, like moving along a toolbar. Radix ignores touch pointers.

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Tooltip.Root',
);
// The `forceMount` of the closest Portal: it keeps the Content mounted too.
const PortalForceMountContext = React.createContext(false);

type TooltipProviderProps = TooltipPrimitive.TooltipProviderProps;
type TooltipProps = TooltipPrimitive.TooltipProps;
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
        <TooltipPrimitive.Root {...props} open={open} onOpenChange={setOpen} />
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

const Trigger = TooltipPrimitive.Trigger;

function Portal({ forceMount, ...props }: TooltipPortalProps) {
  return (
    <PortalForceMountContext value={Boolean(forceMount)}>
      {/* Always mounted: the Content decides when it leaves the DOM, after
          its exit. Closed, it renders nothing, so neither does the portal. */}
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
    <AnimatePresence initial={false}>
      {(open || keepMounted) && (
        <RadixAnchoredContent
          key="content"
          component={TooltipPrimitive.Content}
          contentProps={props}
          open={open}
          keepMounted={keepMounted}
          kind="tooltip"
          origin="var(--radix-tooltip-content-transform-origin)"
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
