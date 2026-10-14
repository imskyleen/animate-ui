'use client';

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  collapsed,
  expanded,
  measurePanel,
  panelStyle,
  releasePanel,
  useDisclosureTransitions,
} from '../../../internal/disclosure-panel';

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Collapsible.Root',
);

type CollapsibleProps = CollapsiblePrimitive.CollapsibleProps;
type CollapsibleTriggerProps = CollapsiblePrimitive.CollapsibleTriggerProps;
type CollapsibleContentProps = CollapsiblePrimitive.CollapsibleContentProps &
  ContentAnimationProps;

type ContentAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

function Root(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const controlled = props.open !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(
    props.defaultOpen ?? false,
  );
  const open = controlled ? Boolean(props.open) : uncontrolled;

  const onOpenChange = (next: boolean) => {
    if (!controlled) setUncontrolled(next);
    props.onOpenChange?.(next);
  };

  return (
    <OpenProvider value={{ open }}>
      <ReducedMotionConfig>
        <CollapsiblePrimitive.Root {...props} onOpenChange={onOpenChange} />
      </ReducedMotionConfig>
    </OpenProvider>
  );
}

const Trigger = CollapsiblePrimitive.Trigger;

function Content({
  forceMount,
  children,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content> &
  ContentAnimationProps) {
  const { open } = useOpen();
  const { enter, exit } = useDisclosureTransitions(transition, exitTransition);
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {(open || forceMount) && (
        <CollapsiblePrimitive.Content {...props} forceMount asChild>
          <motion.div
            ref={ref}
            initial={collapsed}
            animate={
              open
                ? { ...expanded, transition: enter }
                : { ...collapsed, transition: exit }
            }
            exit={{ ...collapsed, transition: exit }}
            onAnimationStart={() => measurePanel(ref.current)}
            onAnimationComplete={() => {
              if (open) releasePanel(ref.current);
            }}
            inert={!open}
            style={{
              ...panelStyle,
              ['--radix-collapsible-content-height' as string]: 'auto',
              ['--radix-collapsible-content-width' as string]: 'auto',
            }}
          >
            {children}
          </motion.div>
        </CollapsiblePrimitive.Content>
      )}
    </AnimatePresence>
  );
}

const createCollapsibleScope: typeof CollapsiblePrimitive.createCollapsibleScope =
  CollapsiblePrimitive.createCollapsibleScope;

Root.displayName = 'Collapsible';
Content.displayName = 'CollapsibleContent';

export {
  Root,
  Trigger,
  Content,
  Root as Collapsible,
  Trigger as CollapsibleTrigger,
  Content as CollapsibleContent,
  createCollapsibleScope,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
};
