'use client';

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from '@base-ui-components/react/collapsible';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

type CollapsibleContextType = {
  isOpen: boolean;
  setIsOpen: CollapsibleProps['onOpenChange'];
};

const [CollapsibleProvider, useCollapsible] =
  getStrictContext<CollapsibleContextType>('CollapsibleContext');

type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root>;

function Collapsible(props: CollapsibleProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <CollapsibleProvider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        {...props}
        onOpenChange={setIsOpen}
      />
    </CollapsibleProvider>
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

type CollapsiblePanelProps = Omit<
  React.ComponentProps<typeof CollapsiblePrimitive.Panel>,
  'keepMounted' | 'render'
> &
  HTMLMotionProps<'div'> & {
    keepRendered?: boolean;
  };

function CollapsiblePanel({
  transition = { duration: 0.35, ease: 'easeInOut' },
  hiddenUntilFound,
  keepRendered = false,
  ...props
}: CollapsiblePanelProps) {
  const { isOpen } = useCollapsible();

  return (
    <AnimatePresence>
      {keepRendered ? (
        <CollapsiblePrimitive.Panel
          hidden={false}
          hiddenUntilFound={hiddenUntilFound}
          keepMounted
          render={
            <motion.div
              key="collapsible-panel"
              data-slot="collapsible-panel"
              initial={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
              animate={
                isOpen
                  ? { height: 'auto', opacity: 1, '--mask-stop': '100%', y: 0 }
                  : { height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }
              }
              transition={transition}
              style={{
                maskImage:
                  'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                WebkitMaskImage:
                  'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                overflow: 'hidden',
              }}
              {...props}
            />
          }
        />
      ) : (
        isOpen && (
          <CollapsiblePrimitive.Panel
            hidden={false}
            hiddenUntilFound={hiddenUntilFound}
            keepMounted
            render={
              <motion.div
                key="collapsible-panel"
                data-slot="collapsible-panel"
                initial={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  '--mask-stop': '100%',
                  y: 0,
                }}
                exit={{ height: 0, opacity: 0, '--mask-stop': '0%', y: 20 }}
                transition={transition}
                style={{
                  maskImage:
                    'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                  WebkitMaskImage:
                    'linear-gradient(black var(--mask-stop), transparent var(--mask-stop))',
                  overflow: 'hidden',
                }}
                {...props}
              />
            }
          />
        )
      )}
    </AnimatePresence>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
  useCollapsible,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsiblePanelProps,
  type CollapsibleContextType,
};
