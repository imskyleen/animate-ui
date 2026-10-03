'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { AnimatePresence, motion } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig, useMotionTokens } from '../../../utils/motion';

// Same API as Radix's Accordion. The Root mirrors the open items (Radix keeps
// them private) so each Content can animate its height in and out.

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
type AccordionContentProps = AccordionPrimitive.AccordionContentProps;

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

// Height is one of the few layout animations worth its cost: the content
// pushes what follows, so it has to grow.
const collapsed = { height: 0, opacity: 0 };
const expanded = { height: 'auto', opacity: 1 };

function Content({
  forceMount,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const { open } = useItemOpen();
  const { transition } = useMotionTokens();

  return (
    <AnimatePresence initial={false}>
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
                ? { ...expanded, transition: transition.disclosure }
                : { ...collapsed, transition: transition.exit }
            }
            exit={{ ...collapsed, transition: transition.exit }}
            // A force-mounted closed item stays in the DOM: keep it out of
            // the tab order and the accessibility tree.
            inert={!open}
            style={{
              overflow: 'hidden',
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
