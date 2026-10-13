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
      isExiting={isExiting || !isPresent}
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
