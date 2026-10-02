'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  scale,
  spring,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

// A tooltip opened within this window after another one closed is "warm":
// it appears without an entrance animation, like moving along a toolbar.
const WARM_WINDOW_MS = 300;
let lastTooltipCloseAt = 0;

type TooltipContextType = {
  isOpen: boolean;
  setIsOpen: TooltipProps['onOpenChange'];
  isWarm: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
  followCursor?: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

const [LocalTooltipProvider, useTooltip] =
  getStrictContext<TooltipContextType>('TooltipContext');

type TooltipProviderProps = React.ComponentProps<
  typeof TooltipPrimitive.Provider
>;

function TooltipProvider(props: TooltipProviderProps) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />;
}

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root> & {
  followCursor?: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

const defaultFollowSpring: SpringOptions = {
  duration: spring.default.duration,
  bounce: spring.default.bounce,
};

function Tooltip({
  followCursor = false,
  followCursorSpringOptions = defaultFollowSpring,
  ...props
}: TooltipProps) {
  const [isWarm, setIsWarm] = React.useState(false);
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleOpenChange: TooltipProps['onOpenChange'] = (open, details) => {
    if (open) setIsWarm(Date.now() - lastTooltipCloseAt < WARM_WINDOW_MS);
    else lastTooltipCloseAt = Date.now();
    setIsOpen(open, details);
  };

  return (
    <LocalTooltipProvider
      value={{
        isOpen,
        setIsOpen,
        isWarm,
        x,
        y,
        followCursor,
        followCursorSpringOptions,
      }}
    >
      <TooltipPrimitive.Root
        data-slot="tooltip"
        {...props}
        onOpenChange={handleOpenChange}
      />
    </LocalTooltipProvider>
  );
}

type TooltipTriggerProps = React.ComponentProps<
  typeof TooltipPrimitive.Trigger
>;

function TooltipTrigger({ onMouseMove, ...props }: TooltipTriggerProps) {
  const { x, y, followCursor } = useTooltip();

  const handleMouseMove = (
    event: Parameters<NonNullable<TooltipTriggerProps['onMouseMove']>>[0],
  ) => {
    onMouseMove?.(event);
    if (!followCursor) return;

    const target = event.currentTarget.getBoundingClientRect();

    if (followCursor === 'x' || followCursor === true) {
      const eventOffsetX = event.clientX - target.left;
      const offsetXFromCenter = (eventOffsetX - target.width / 2) / 2;
      x.set(offsetXFromCenter);
    }

    if (followCursor === 'y' || followCursor === true) {
      const eventOffsetY = event.clientY - target.top;
      const offsetYFromCenter = (eventOffsetY - target.height / 2) / 2;
      y.set(offsetYFromCenter);
    }
  };

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onMouseMove={handleMouseMove}
      {...props}
    />
  );
}

type TooltipPortalProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Portal>,
  'keepMounted'
>;

function TooltipPortal({ children, ...props }: TooltipPortalProps) {
  const { isOpen } = useTooltip();

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipPrimitive.Portal
          keepMounted
          data-slot="tooltip-portal"
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type TooltipPositionerProps = React.ComponentProps<
  typeof TooltipPrimitive.Positioner
>;

function TooltipPositioner(props: TooltipPositionerProps) {
  return (
    <TooltipPrimitive.Positioner data-slot="tooltip-positioner" {...props} />
  );
}

type TooltipPopupProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'>;

function TooltipPopup({
  transition = motionTransition.tooltip,
  style,
  ...props
}: TooltipPopupProps) {
  const { isWarm, x, y, followCursor, followCursorSpringOptions } =
    useTooltip();
  const translateX = useSpring(x, followCursorSpringOptions);
  const translateY = useSpring(y, followCursorSpringOptions);
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };
  const visible = { opacity: 1, transform: 'scale(1)', transition };
  // `translate` composes with the animated `transform`, so following the
  // cursor never interrupts the entrance.
  const translate = useMotionTemplate`${followCursor === 'y' ? 0 : translateX}px ${followCursor === 'x' ? 0 : translateY}px`;

  return (
    <TooltipPrimitive.Popup
      render={
        <motion.div
          data-slot="tooltip-popup"
          initial={isWarm ? false : hidden}
          animate={visible}
          exit={{ ...hidden, transition: motionTransition.exit }}
          style={{
            transformOrigin: 'var(--transform-origin)',
            translate: followCursor ? translate : undefined,
            ...style,
          }}
          {...props}
        />
      }
    />
  );
}

type TooltipArrowProps = React.ComponentProps<typeof TooltipPrimitive.Arrow>;

function TooltipArrow(props: TooltipArrowProps) {
  return <TooltipPrimitive.Arrow data-slot="tooltip-arrow" {...props} />;
}

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
  TooltipArrow,
  useTooltip,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipPortalProps,
  type TooltipPositionerProps,
  type TooltipPopupProps,
  type TooltipArrowProps,
  type TooltipContextType,
};
