'use client';

import * as React from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { cn } from '@workspace/ui/lib/utils';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  scale,
  transition as motionTransition,
  useShouldReduceMotion,
} from '@/registry/lib/motion';

type HoverCardContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [HoverCardProvider, useHoverCard] =
  getStrictContext<HoverCardContextType>('HoverCardContext');

function HoverCard({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  const [isOpen, setIsOpen] = useControlledState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  return (
    <HoverCardProvider value={{ isOpen, setIsOpen }}>
      <HoverCardPrimitive.Root
        data-slot="hover-card"
        open={isOpen}
        onOpenChange={setIsOpen}
        {...props}
      />
    </HoverCardProvider>
  );
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

type HoverCardContentProps = Omit<
  React.ComponentProps<typeof HoverCardPrimitive.Content>,
  'forceMount' | 'asChild'
> & {
  transition?: Transition;
};

function HoverCardContent(props: HoverCardContentProps) {
  const { isOpen } = useHoverCard();

  return (
    <AnimatePresence>
      {isOpen && (
        <HoverCardPrimitive.Portal forceMount data-slot="hover-card-portal">
          <ReducedMotionConfig>
            <HoverCardContentMotion {...props} />
          </ReducedMotionConfig>
        </HoverCardPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function HoverCardContentMotion({
  className,
  children,
  align = 'center',
  sideOffset = 4,
  transition = motionTransition.dropdown,
  ...props
}: HoverCardContentProps) {
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };

  return (
    <HoverCardPrimitive.Content
      asChild
      forceMount
      data-slot="hover-card-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-hidden',
        className,
      )}
      {...props}
    >
      <motion.div
        initial={hidden}
        animate={{ opacity: 1, transform: 'scale(1)', transition }}
        exit={{ ...hidden, transition: motionTransition.exit }}
        style={{
          transformOrigin: 'var(--radix-hover-card-content-transform-origin)',
        }}
      >
        {children}
      </motion.div>
    </HoverCardPrimitive.Content>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
