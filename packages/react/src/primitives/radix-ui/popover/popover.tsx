'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { AnimatePresence } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import type { AnchoredAnimationProps } from '../../../internal/anchored';
import { RadixAnchoredContent, useRadixOpenState } from './radix-anchored';

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Popover.Root',
);
const PortalForceMountContext = React.createContext(false);

type PopoverProps = PopoverPrimitive.PopoverProps;
type PopoverTriggerProps = PopoverPrimitive.PopoverTriggerProps;
type PopoverAnchorProps = PopoverPrimitive.PopoverAnchorProps;
type PopoverPortalProps = PopoverPrimitive.PopoverPortalProps;
type PopoverContentProps = PopoverPrimitive.PopoverContentProps &
  AnchoredAnimationProps;
type PopoverCloseProps = PopoverPrimitive.PopoverCloseProps;
type PopoverArrowProps = PopoverPrimitive.PopoverArrowProps;

function Root({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: PopoverProps) {
  const [open, setOpen] = useRadixOpenState(
    openProp,
    defaultOpen,
    onOpenChange,
  );

  return (
    <OpenProvider value={{ open }}>
      <ReducedMotionConfig>
        <PopoverPrimitive.Root {...props} open={open} onOpenChange={setOpen} />
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

const Trigger = PopoverPrimitive.Trigger;
const Anchor = PopoverPrimitive.Anchor;

function Portal({ forceMount, ...props }: PopoverPortalProps) {
  return (
    <PortalForceMountContext value={Boolean(forceMount)}>
      <PopoverPrimitive.Portal {...props} forceMount />
    </PortalForceMountContext>
  );
}

function Content({
  forceMount,
  transition,
  exitTransition,
  ...props
}: PopoverContentProps & React.RefAttributes<HTMLDivElement>) {
  const { open } = useOpen();
  const keepMounted = Boolean(forceMount) || React.use(PortalForceMountContext);

  return (
    <AnimatePresence>
      {(open || keepMounted) && (
        <RadixAnchoredContent
          key="content"
          component={PopoverPrimitive.Content}
          contentProps={props}
          open={open}
          keepMounted={keepMounted}
          origin="var(--radix-popover-content-transform-origin)"
          transition={transition}
          exitTransition={exitTransition}
        />
      )}
    </AnimatePresence>
  );
}

const Close = PopoverPrimitive.Close;
const Arrow = PopoverPrimitive.Arrow;

const createPopoverScope: typeof PopoverPrimitive.createPopoverScope =
  PopoverPrimitive.createPopoverScope;

Content.displayName = 'PopoverContent';

export {
  Root,
  Trigger,
  Anchor,
  Portal,
  Content,
  Close,
  Arrow,
  Root as Popover,
  Trigger as PopoverTrigger,
  Anchor as PopoverAnchor,
  Portal as PopoverPortal,
  Content as PopoverContent,
  Close as PopoverClose,
  Arrow as PopoverArrow,
  createPopoverScope,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverAnchorProps,
  type PopoverPortalProps,
  type PopoverContentProps,
  type PopoverCloseProps,
  type PopoverArrowProps,
};
