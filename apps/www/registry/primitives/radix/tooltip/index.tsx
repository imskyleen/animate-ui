'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type SpringOptions,
  type HTMLMotionProps,
  type MotionValue,
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
  setIsOpen: (isOpen: boolean) => void;
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

  const handleOpenChange = (open: boolean) => {
    if (open) setIsWarm(Date.now() - lastTooltipCloseAt < WARM_WINDOW_MS);
    else lastTooltipCloseAt = Date.now();
    setIsOpen(open);
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

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    onMouseMove?.(event);
    if (!followCursor) return;

    const target = event.currentTarget.getBoundingClientRect();

    if (followCursor === 'x' || followCursor === true) {
      const eventOffsetX = event.clientX - target.left;
      x.set((eventOffsetX - target.width / 2) / 2);
    }

    if (followCursor === 'y' || followCursor === true) {
      const eventOffsetY = event.clientY - target.top;
      y.set((eventOffsetY - target.height / 2) / 2);
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
  'forceMount'
>;

function TooltipPortal({ children, ...props }: TooltipPortalProps) {
  const { isOpen } = useTooltip();

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipPrimitive.Portal
          forceMount
          data-slot="tooltip-portal"
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type TooltipContentProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Content>,
  'forceMount' | 'asChild'
> &
  HTMLMotionProps<'div'>;

function TooltipContent({
  onEscapeKeyDown,
  onPointerDownOutside,
  side,
  sideOffset,
  align,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  style,
  transition = motionTransition.tooltip,
  ...props
}: TooltipContentProps) {
  const { isWarm, x, y, followCursor, followCursorSpringOptions } =
    useTooltip();
  const translateX = useSpring(x, followCursorSpringOptions);
  const translateY = useSpring(y, followCursorSpringOptions);
  // `translate` composes with the animated `transform`, so following the
  // cursor never interrupts the entrance.
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };
  const visible = { opacity: 1, transform: 'scale(1)', transition };
  const translate = useMotionTemplate`${followCursor === 'y' ? 0 : translateX}px ${followCursor === 'x' ? 0 : translateY}px`;

  return (
    <TooltipPrimitive.Content
      asChild
      forceMount
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      avoidCollisions={avoidCollisions}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      arrowPadding={arrowPadding}
      sticky={sticky}
      hideWhenDetached={hideWhenDetached}
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
    >
      <motion.div
        data-slot="tooltip-content"
        initial={isWarm ? false : hidden}
        animate={visible}
        exit={{ ...hidden, transition: motionTransition.exit }}
        style={{
          transformOrigin: 'var(--radix-tooltip-content-transform-origin)',
          translate: followCursor ? translate : undefined,
          ...style,
        }}
        {...props}
      />
    </TooltipPrimitive.Content>
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
  TooltipContent,
  TooltipArrow,
  useTooltip,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipPortalProps,
  type TooltipContentProps,
  type TooltipArrowProps,
  type TooltipContextType,
};
