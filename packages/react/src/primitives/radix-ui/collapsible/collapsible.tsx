'use client';

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import { useDisclosureTransitions } from '../../../internal/disclosure-panel';

// Same API as Radix's Collapsible. The Root mirrors the open state (Radix
// keeps it private) so the Content can animate in and out like Animate UI
// v1's: height, fade and a 20px rise.

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Collapsible.Root',
);

type CollapsibleProps = CollapsiblePrimitive.CollapsibleProps;
type CollapsibleTriggerProps = CollapsiblePrimitive.CollapsibleTriggerProps;
type CollapsibleContentProps = CollapsiblePrimitive.CollapsibleContentProps &
  ContentAnimationProps;

/** Animate UI's additions to `Collapsible.Content`. */
type ContentAnimationProps = {
  /** Transition of the opening. Defaults to 350ms ease-in-out. */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
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

// v1's Radix Collapsible: unlike the accordions, no mask.
const collapsed = { height: 0, opacity: 0, y: 20 };
const expanded = { height: 'auto', opacity: 1, y: 0 };

function Content({
  forceMount,
  children,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content> &
  ContentAnimationProps) {
  const { open } = useOpen();
  // v1's content: 350ms ease-in-out both ways; under reduced motion the
  // height and the rise jump (see internal/disclosure-panel).
  const { enter, exit } = useDisclosureTransitions(transition, exitTransition);

  return (
    // Open on mount (an item open by default), it animates open, as in v1.
    <AnimatePresence>
      {(open || forceMount) && (
        // Radix's props (className, style, data-state, ids…) land on the
        // motion.div through asChild; it only carries the animation.
        <CollapsiblePrimitive.Content {...props} forceMount asChild>
          <motion.div
            initial={collapsed}
            // Transitions live in the targets: an exiting element keeps the
            // props of its last render, when it was still open.
            animate={
              open
                ? { ...expanded, transition: enter }
                : { ...collapsed, transition: exit }
            }
            exit={{ ...collapsed, transition: exit }}
            // A force-mounted closed panel stays in the DOM: keep it out of
            // the tab order and the accessibility tree.
            inert={!open}
            style={{
              overflow: 'hidden',
              // Radix measures these once; Motion owns the size now, so
              // classes reading them (h-(--radix-collapsible-content-height))
              // follow the content instead of a stale measure.
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

export {
  Root,
  Trigger,
  Content,
  // `Collapsible` is Radix's alias of Root: with the radix-ui import style,
  // `CollapsiblePrimitive.Collapsible` keeps working.
  Root as Collapsible,
  Trigger as CollapsibleTrigger,
  Content as CollapsibleContent,
  createCollapsibleScope,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
};
