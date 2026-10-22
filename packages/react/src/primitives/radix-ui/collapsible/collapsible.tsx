'use client';

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  collapsed,
  expanded,
  fitGap,
  measurePanel,
  panelStyle,
  releasePanel,
  useDisclosureTransitions,
} from '../../../internal/disclosure-panel';
import { useSubmenuStagger } from '../../../internal/stagger';
import { MotionSlot, slotChild } from '../../../internal/modal-motion';

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
  asChild,
  children,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content> &
  ContentAnimationProps) {
  const { open } = useOpen();
  const { enter, exit } = useDisclosureTransitions(transition, exitTransition);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => fitGap(ref.current), [open]);
  useSubmenuStagger(ref, open);

  const slot = slotChild(asChild, children);
  return (
    <AnimatePresence>
      {(open || forceMount) && (
        <CollapsiblePrimitive.Content {...props} forceMount asChild>
          <MotionSlot
            element={slot.element}
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
            {slot.inner}
          </MotionSlot>
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
