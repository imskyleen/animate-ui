'use client';

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig, useMotionTokens } from '../../../utils/motion';

// Same API as Radix's Collapsible. The Root mirrors the open state (Radix
// keeps it private) so the Content can animate its height in and out.

const [OpenProvider, useOpen] = getStrictContext<{ open: boolean }>(
  'Collapsible.Root',
);

type CollapsibleProps = CollapsiblePrimitive.CollapsibleProps;
type CollapsibleTriggerProps = CollapsiblePrimitive.CollapsibleTriggerProps;
type CollapsibleContentProps = CollapsiblePrimitive.CollapsibleContentProps &
  ContentAnimationProps;

/** Animate UI's additions to `Collapsible.Content`. */
type ContentAnimationProps = {
  /** Transition of the opening. Defaults to `transition.disclosure` (600ms). */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition.exit` (400ms). */
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

// Height is one of the few layout animations worth its cost: the content
// pushes what follows, so it has to grow.
const collapsed = { height: 0, opacity: 0 };
const expanded = { height: 'auto', opacity: 1 };

function Content({
  forceMount,
  children,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content> &
  ContentAnimationProps) {
  const { open } = useOpen();
  const tokens = useMotionTokens();
  const enter = transition ?? tokens.transition.disclosure;
  const exit = exitTransition ?? tokens.transition.exit;

  return (
    <AnimatePresence initial={false}>
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
