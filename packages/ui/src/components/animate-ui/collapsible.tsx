'use client';

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

type CollapsibleContextType = {
  isOpen: boolean;
};

const CollapsibleContext = React.createContext<
  CollapsibleContextType | undefined
>(undefined);

const useCollapsible = (): CollapsibleContextType => {
  const context = React.use(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within a Collapsible');
  }
  return context;
};

type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>;

function Collapsible({ children, ...props }: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    props?.defaultOpen ?? false,
  );
  const isOpen = props?.open ?? uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setUncontrolledOpen(open);
      props.onOpenChange?.(open);
    },
    [props],
  );

  return (
    <CollapsibleContext value={{ isOpen }}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        {...props}
        onOpenChange={handleOpenChange}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </CollapsibleContext>
  );
}

type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.Trigger
>;

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  );
}

type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.Content
> &
  HTMLMotionProps<'div'> & {
    transition?: Transition;
  };

function CollapsibleContent({
  className,
  children,
  transition = { type: 'spring', stiffness: 150, damping: 22 },
  ...props
}: CollapsibleContentProps) {
  const { isOpen } = useCollapsible();

  return (
    <AnimatePresence>
      {isOpen && (
        <CollapsiblePrimitive.Content asChild forceMount {...props}>
          <motion.div
            key="collapsible-content"
            data-slot="collapsible-content"
            layout
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'hidden' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={transition}
            className={className}
            {...props}
          >
            {children}
          </motion.div>
        </CollapsiblePrimitive.Content>
      )}
    </AnimatePresence>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
  type CollapsibleContextType,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
};
