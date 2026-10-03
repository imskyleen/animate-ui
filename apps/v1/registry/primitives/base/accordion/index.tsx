'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';
import {
  ReducedMotionConfig,
  transition as motionTransition,
} from '@/registry/lib/motion';

type AccordionValue = AccordionPrimitive.Root.Props['value'];

type AccordionContextType = {
  value: AccordionValue;
  setValue: (value: AccordionValue) => void;
  multiple: boolean;
};

type AccordionItemContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [AccordionProvider, useAccordion] =
  getStrictContext<AccordionContextType>('AccordionContext');

const [AccordionItemProvider, useAccordionItem] =
  getStrictContext<AccordionItemContextType>('AccordionItemContext');

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>;

function Accordion(props: AccordionProps) {
  const [value, setValue] = useControlledState<AccordionValue>({
    value: props?.value,
    defaultValue: props?.defaultValue,
    onChange: props?.onValueChange as (value: AccordionValue) => void,
  });

  return (
    <AccordionProvider
      value={{ value, setValue, multiple: props.multiple ?? false }}
    >
      <ReducedMotionConfig>
        <AccordionPrimitive.Root
          data-slot="accordion"
          {...props}
          onValueChange={setValue}
        />
      </ReducedMotionConfig>
    </AccordionProvider>
  );
}

type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;

function AccordionItem(props: AccordionItemProps) {
  const { value, setValue, multiple } = useAccordion();
  const isOpen = value?.includes(props.value) ?? false;

  const setIsOpen = (open: boolean) => {
    const current = value ?? [];
    if (open) setValue(multiple ? [...current, props.value] : [props.value]);
    else setValue(current.filter((v) => v !== props.value));
  };

  return (
    <AccordionItemProvider value={{ isOpen, setIsOpen }}>
      <AccordionPrimitive.Item data-slot="accordion-item" {...props} />
    </AccordionItemProvider>
  );
}

type AccordionHeaderProps = React.ComponentProps<
  typeof AccordionPrimitive.Header
>;

function AccordionHeader(props: AccordionHeaderProps) {
  return <AccordionPrimitive.Header data-slot="accordion-header" {...props} />;
}

type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
>;

function AccordionTrigger(props: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Trigger data-slot="accordion-trigger" {...props} />
  );
}

type AccordionPanelProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Panel>,
  'keepMounted' | 'render'
> &
  HTMLMotionProps<'div'> & {
    keepRendered?: boolean;
  };

// Height is one of the few layout animations allowed: keep it short.
const collapsed = { height: 0, opacity: 0 };
const expanded = { height: 'auto', opacity: 1 };

function AccordionPanel({
  transition = motionTransition.disclosure,
  hiddenUntilFound,
  keepRendered = false,
  style,
  ...props
}: AccordionPanelProps) {
  const { isOpen } = useAccordionItem();

  return (
    <AnimatePresence initial={false}>
      {keepRendered ? (
        <AccordionPrimitive.Panel
          hidden={false}
          hiddenUntilFound={hiddenUntilFound}
          keepMounted
          render={
            <motion.div
              data-slot="accordion-panel"
              initial={false}
              animate={isOpen ? expanded : collapsed}
              transition={transition}
              style={{ overflow: 'hidden', ...style }}
              {...props}
            />
          }
        />
      ) : (
        isOpen && (
          <AccordionPrimitive.Panel
            hidden={false}
            hiddenUntilFound={hiddenUntilFound}
            keepMounted
            render={
              <motion.div
                data-slot="accordion-panel"
                initial={collapsed}
                animate={expanded}
                exit={collapsed}
                transition={transition}
                style={{ overflow: 'hidden', ...style }}
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
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
  useAccordionItem,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionHeaderProps,
  type AccordionTriggerProps,
  type AccordionPanelProps,
  type AccordionItemContextType,
};
