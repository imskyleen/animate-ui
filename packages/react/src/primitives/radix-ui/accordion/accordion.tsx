'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
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

type Value = string | string[] | undefined;

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

type ContentAnimationProps = {
  transition?: Transition;
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
  const { enter, exit } = useDisclosureTransitions(transition, exitTransition);
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {(open || forceMount) && (
        <AccordionPrimitive.Content {...props} forceMount asChild>
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

Root.displayName = 'Accordion';
Item.displayName = 'AccordionItem';
Content.displayName = 'AccordionContent';

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
