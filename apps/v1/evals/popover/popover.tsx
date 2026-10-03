'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
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

type PopoverContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [PopoverProvider, usePopover] =
  getStrictContext<PopoverContextType>('PopoverContext');

function Popover({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const [isOpen, setIsOpen] = useControlledState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  return (
    <PopoverProvider value={{ isOpen, setIsOpen }}>
      <PopoverPrimitive.Root
        data-slot="popover"
        open={isOpen}
        onOpenChange={setIsOpen}
        {...props}
      />
    </PopoverProvider>
  );
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

type PopoverContentProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Content>,
  'forceMount' | 'asChild'
> & {
  /** Motion transition for the enter and exit. Defaults to `transition.dropdown`. */
  transition?: Transition;
};

function PopoverContent(props: PopoverContentProps) {
  const { isOpen } = usePopover();

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Portal forceMount>
          <ReducedMotionConfig>
            <PopoverContentMotion {...props} />
          </ReducedMotionConfig>
        </PopoverPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

// Rendered inside ReducedMotionConfig so useShouldReduceMotion() sees it.
function PopoverContentMotion({
  className,
  children,
  align = 'center',
  sideOffset = 4,
  transition = motionTransition.dropdown,
  ...props
}: PopoverContentProps) {
  const reduce = useShouldReduceMotion();
  const hidden = {
    opacity: 0,
    transform: reduce ? 'scale(1)' : `scale(${scale.enter})`,
  };
  const visible = { opacity: 1, transform: 'scale(1)' };

  // Radix props, className, style and handlers go on Content; its Slot merges
  // them onto the motion.div, which only carries the animation.
  return (
    <PopoverPrimitive.Content
      asChild
      forceMount
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden',
        className,
      )}
      {...props}
    >
      <motion.div
        initial={hidden}
        animate={{ ...visible, transition }}
        exit={{ ...hidden, transition: motionTransition.exit }}
        style={{
          transformOrigin: 'var(--radix-popover-content-transform-origin)',
        }}
      >
        {children}
      </motion.div>
    </PopoverPrimitive.Content>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  type PopoverContentProps,
};
