'use client';

import * as React from 'react';
import {
  Tooltip as TooltipPrimitive,
  TooltipContext,
  TooltipTriggerStateContext,
  useSlottedContext,
  type TooltipProps as TooltipPrimitiveProps,
} from 'react-aria-components';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  asMotion,
  useAnchoredMotion,
  useTooltipWarmth,
  type AnchoredAnimationProps,
} from '../../../internal/anchored';
import { originFor } from '../popover/origin';

// Same API as React Aria's Tooltip. It scales up from the trigger and fades
// in, and leaves faster than it came. A tooltip opened right after another
// one closed is warm: it appears at once, like moving along a toolbar, and
// one replaced by its neighbour leaves at once (React Aria's warmup).
//
// Like the Popover, it gates itself with AnimatePresence on the open state
// React Aria reads, and passes `isExiting` while the exit plays.

type TooltipProps = TooltipPrimitiveProps & AnchoredAnimationProps;

type TooltipContextValue = TooltipPrimitiveProps | null | undefined;

function Tooltip({
  transition,
  exitTransition,
  ref,
  ...props
}: TooltipProps & React.RefAttributes<HTMLDivElement>) {
  const context = useSlottedContext(TooltipContext) as TooltipContextValue;
  const triggerState = React.use(TooltipTriggerStateContext);

  // Same rule as React Aria: its own state when controlled, uncontrolled or
  // standalone; otherwise the TooltipTrigger's.
  const isOpenProp = props.isOpen ?? context?.isOpen;
  const defaultOpen = props.defaultOpen ?? context?.defaultOpen;
  const local = isOpenProp != null || defaultOpen != null || !triggerState;
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = local
    ? (isOpenProp ?? uncontrolled)
    : (triggerState?.isOpen ?? false);

  const onOpenChange = (next: boolean) => {
    if (isOpenProp == null) setUncontrolled(next);
    props.onOpenChange?.(next);
  };
  const tooltipProps = {
    ...props,
    ref,
    // Its own state: handed back to React Aria, one source of truth.
    ...(local && { isOpen: open, defaultOpen: undefined, onOpenChange }),
  };

  return (
    <ReducedMotionConfig>
      <AnimatePresence initial={false}>
        {open && (
          <AnimatedTooltip
            key="tooltip"
            tooltipProps={tooltipProps}
            transition={transition}
            exitTransition={exitTransition}
          />
        )}
      </AnimatePresence>
    </ReducedMotionConfig>
  );
}

type AnimatedTooltipProps = AnchoredAnimationProps & {
  tooltipProps: TooltipPrimitiveProps & React.RefAttributes<HTMLDivElement>;
};

function AnimatedTooltip({
  tooltipProps: { render, isExiting, ...props },
  transition,
  exitTransition,
}: AnimatedTooltipProps) {
  const isPresent = useIsPresent();
  // React Aria's warmup: set when this tooltip opens or closes instantly
  // because it swaps with another one.
  const instant = React.use(TooltipTriggerStateContext)?.shouldSkipAnimation;
  const [openedInstantly] = React.useState(Boolean(instant));
  const warm = useTooltipWarmth({
    enabled: true,
    open: isPresent,
    shown: true,
  });
  const motionProps = useAnchoredMotion({
    kind: 'tooltip',
    open: true,
    skipEnter: warm || openedInstantly,
    skipExit: Boolean(instant),
    transition,
    exitTransition,
  });

  return (
    <TooltipPrimitive
      {...props}
      // Mounted until the exit is over, like React Aria's CSS animations.
      isExiting={isExiting || !isPresent}
      // React Aria's render prop: its props (resolved className and style,
      // data-placement, role, ref…) land on the motion element.
      render={(domProps, values) => {
        const elementProps = {
          ...motionProps,
          style: {
            transformOrigin: originFor(values.placement),
            ...domProps.style,
          },
        };
        return render ? (
          asMotion(render(domProps, values), elementProps)
        ) : (
          <motion.div
            {...(domProps as Record<string, unknown>)}
            {...elementProps}
          />
        );
      }}
    />
  );
}

export { Tooltip, type TooltipProps };
