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
  type AnchoredAnimationProps,
} from '../../../internal/anchored';
import { originFor } from '../popover/origin';

// Same API as React Aria's Tooltip, animated like the Radix and Base UI
// tooltips: it grows from 0.7 and fades in from the trigger on a spring,
// and shrinks back the same way.
// When React Aria swaps two tooltips during its warmup (it asks to skip the
// animations), they swap at once.
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
      <AnimatePresence>
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
  const motionProps = useAnchoredMotion({
    kind: 'tooltip',
    open: true,
    instant: isPresent ? openedInstantly : Boolean(instant),
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
            ...motionProps.style,
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
