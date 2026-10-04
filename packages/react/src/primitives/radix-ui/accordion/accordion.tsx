'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { AnimatePresence, motion, type Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  collapsed,
  expanded,
  maskStyle,
  useDisclosureTransitions,
} from '../../../internal/disclosure-panel';

// Same API as Radix's Accordion. The Root mirrors the open items (Radix keeps
// them private) so each Content can animate in and out like Animate UI v1's:
// height, fade, a 20px rise and a mask revealing it top to bottom.

type Value = string | string[] | undefined;

// Objects, not raw values: an accordion with nothing open has an undefined
// value, which a strict context would read as "no provider".
const [OpenItemsProvider, useOpenItems] = getStrictContext<{ value: Value }>(
  'Accordion.Root',
);
const [ItemOpenProvider, useItemOpen] = getStrictContext<{ open: boolean }>(
  'Accordion.Item',
);

type AccordionSingleProps = AccordionPrimitive.AccordionSingleProps;
type AccordionMultipleProps = AccordionPrimitive.AccordionMultipleProps;
type AccordionItemProps = AccordionPrimitive.AccordionItemProps;
type AccordionHeaderProps = AccordionPrimitive.AccordionHeaderProps;
type AccordionTriggerProps = AccordionPrimitive.AccordionTriggerProps;
type AccordionContentProps = AccordionPrimitive.AccordionContentProps &
  ContentAnimationProps;

/** Animate UI's additions to `Accordion.Content`. */
type ContentAnimationProps = {
  /**
   * Transition of the opening.
   * @default { duration: 0.35, ease: [0.23, 1, 0.32, 1] }
   */
  transition?: Transition;
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: Transition;
};

function Root(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  const controlled = props.value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<Value>(
    props.defaultValue,
  );
  const value = controlled ? props.value : uncontrolled;

  const onValueChange = (next: string & string[]) => {
    if (!controlled) setUncontrolled(next);
    props.onValueChange?.(next);
  };

  return (
    <OpenItemsProvider value={{ value }}>
      <ReducedMotionConfig>
        <AccordionPrimitive.Root {...props} onValueChange={onValueChange} />
      </ReducedMotionConfig>
    </OpenItemsProvider>
  );
}

function Item(props: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { value } = useOpenItems();
  const open = Array.isArray(value)
    ? value.includes(props.value)
    : value === props.value;

  return (
    <ItemOpenProvider value={{ open }}>
      <AccordionPrimitive.Item {...props} />
    </ItemOpenProvider>
  );
}

const Header = AccordionPrimitive.Header;
const Trigger = AccordionPrimitive.Trigger;

function Content({
  forceMount,
  children,
  transition,
  exitTransition,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> &
  ContentAnimationProps) {
  const { open } = useItemOpen();
  // The content: 350ms ease-out both ways; under reduced motion the
  // height and the rise jump (see internal/disclosure-panel).
  const { enter, exit } = useDisclosureTransitions(transition, exitTransition);

  return (
    // Open on mount (an item open by default), it animates open, as in v1.
    <AnimatePresence>
      {(open || forceMount) && (
        // Radix's props (className, style, data-state, ids…) land on the
        // motion.div through asChild; it only carries the animation.
        <AccordionPrimitive.Content {...props} forceMount asChild>
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
            // A force-mounted closed item stays in the DOM: keep it out of
            // the tab order and the accessibility tree.
            inert={!open}
            style={{
              overflow: 'hidden',
              ...maskStyle,
              // Radix measures these once; Motion owns the height now, so
              // classes reading them (h-(--radix-accordion-content-height))
              // follow the content instead of a stale measure.
              ['--radix-collapsible-content-height' as string]: 'auto',
              ['--radix-accordion-content-height' as string]: 'auto',
            }}
          >
            {children}
          </motion.div>
        </AccordionPrimitive.Content>
      )}
    </AnimatePresence>
  );
}

const createAccordionScope: typeof AccordionPrimitive.createAccordionScope =
  AccordionPrimitive.createAccordionScope;

export {
  Root,
  Item,
  Header,
  Trigger,
  Content,
  Item as AccordionItem,
  Header as AccordionHeader,
  Trigger as AccordionTrigger,
  Content as AccordionContent,
  createAccordionScope,
  type AccordionSingleProps,
  type AccordionMultipleProps,
  type AccordionItemProps,
  type AccordionHeaderProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
};
