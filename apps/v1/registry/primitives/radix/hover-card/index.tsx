'use client';

import * as React from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type MotionValue,
  type HTMLMotionProps,
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

type HoverCardContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  x: MotionValue<number>;
  y: MotionValue<number>;
  followCursor?: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

const [HoverCardProvider, useHoverCard] =
  getStrictContext<HoverCardContextType>('HoverCardContext');

type HoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root> & {
  followCursor?: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

const defaultFollowSpring: SpringOptions = {
  duration: spring.default.duration,
  bounce: spring.default.bounce,
};

function HoverCard({
  followCursor = false,
  followCursorSpringOptions = defaultFollowSpring,
  ...props
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <HoverCardProvider
      value={{
        isOpen,
        setIsOpen,
        x,
        y,
        followCursor,
        followCursorSpringOptions,
      }}
    >
      <HoverCardPrimitive.Root
        data-slot="hover-card"
        {...props}
        onOpenChange={setIsOpen}
      />
    </HoverCardProvider>
  );
}

type HoverCardTriggerProps = React.ComponentProps<
  typeof HoverCardPrimitive.Trigger
>;

function HoverCardTrigger({ onMouseMove, ...props }: HoverCardTriggerProps) {
  const { x, y, followCursor } = useHoverCard();

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
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
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      onMouseMove={handleMouseMove}
      {...props}
    />
  );
}

type HoverCardPortalProps = Omit<
  React.ComponentProps<typeof HoverCardPrimitive.Portal>,
  'forceMount'
>;

function HoverCardPortal({ children, ...props }: HoverCardPortalProps) {
  const { isOpen } = useHoverCard();

  return (
    <AnimatePresence>
      {isOpen && (
        <HoverCardPrimitive.Portal
          forceMount
          data-slot="hover-card-portal"
          {...props}
        >
          <ReducedMotionConfig>{children}</ReducedMotionConfig>
        </HoverCardPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type HoverCardContentProps = React.ComponentProps<
  typeof HoverCardPrimitive.Content
> &
  HTMLMotionProps<'div'>;

function HoverCardContent({
  align,
  alignOffset,
  side,
  sideOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  style,
  transition = motionTransition.dropdown,
  ...props
}: HoverCardContentProps) {
  const { x, y, followCursor, followCursorSpringOptions } = useHoverCard();
  const translateX = useSpring(x, followCursorSpringOptions);
  const translateY = useSpring(y, followCursorSpringOptions);
  // `translate` composes with the animated `transform`, so following the
  // cursor never interrupts the entrance.
  const translate = useMotionTemplate`${followCursor === 'y' ? 0 : translateX}px ${followCursor === 'x' ? 0 : translateY}px`;
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <HoverCardPrimitive.Content
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
    >
      <motion.div
        data-slot="hover-card-content"
        initial={hidden}
        animate={{ opacity: 1, transform: 'scale(1)', transition }}
        exit={{ ...hidden, transition: motionTransition.exit }}
        style={{
          transformOrigin: 'var(--radix-hover-card-content-transform-origin)',
          translate: followCursor ? translate : undefined,
          ...style,
        }}
        {...props}
      />
    </HoverCardPrimitive.Content>
  );
}

type HoverCardArrowProps = React.ComponentProps<
  typeof HoverCardPrimitive.Arrow
>;

function HoverCardArrow(props: HoverCardArrowProps) {
  return <HoverCardPrimitive.Arrow data-slot="hover-card-arrow" {...props} />;
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  HoverCardArrow,
  useHoverCard,
  type HoverCardProps,
  type HoverCardTriggerProps,
  type HoverCardPortalProps,
  type HoverCardContentProps,
  type HoverCardArrowProps,
  type HoverCardContextType,
};
