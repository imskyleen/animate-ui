'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';

import { useControlledState } from '@/registry/hooks/use-controlled-state';
import { getStrictContext } from '@/registry/lib/get-strict-context';
import {
  ReducedMotionConfig,
  transition as motionTransition,
} from '@/registry/lib/motion';

type AccordionContextType = {
  value: string | string[] | undefined;
  setValue: (value: string | string[] | undefined) => void;
  multiple: boolean;
};

type AccordionItemContextType = {
  value: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [AccordionProvider, useAccordion] =
  getStrictContext<AccordionContextType>('AccordionContext');

const [AccordionItemProvider, useAccordionItem] =
  getStrictContext<AccordionItemContextType>('AccordionItemContext');

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>;

function Accordion(props: AccordionProps) {
  const [value, setValue] = useControlledState<string | string[] | undefined>({
    value: props?.value,
    defaultValue: props?.defaultValue,
    onChange: props?.onValueChange as (
      value: string | string[] | undefined,
    ) => void,
  });

  return (
    <AccordionProvider
      value={{ value, setValue, multiple: props.type === 'multiple' }}
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
  const isOpen = Array.isArray(value)
    ? value.includes(props.value)
    : value === props.value;

  const setIsOpen = (open: boolean) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      setValue(
        open
          ? [...current, props.value]
          : current.filter((v) => v !== props.value),
      );
    } else {
      setValue(open ? props.value : '');
    }
  };

  return (
    <AccordionItemProvider value={{ isOpen, setIsOpen, value: props.value }}>
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

type AccordionContentProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Content>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'> & {
    keepRendered?: boolean;
  };

// Height is one of the few layout animations allowed: keep it short.
const collapsed = { height: 0, opacity: 0 };
const expanded = { height: 'auto', opacity: 1 };

function AccordionContent({
  keepRendered = false,
  transition = motionTransition.disclosure,
  style,
  ...props
}: AccordionContentProps) {
  const { isOpen } = useAccordionItem();

  return (
    <AnimatePresence initial={false}>
      {keepRendered ? (
        <AccordionPrimitive.Content asChild forceMount>
          <motion.div
            data-slot="accordion-content"
            initial={false}
            animate={isOpen ? expanded : collapsed}
            transition={transition}
            style={{ overflow: 'hidden', ...style }}
            {...props}
          />
        </AccordionPrimitive.Content>
      ) : (
        isOpen && (
          <AccordionPrimitive.Content asChild forceMount>
            <motion.div
              data-slot="accordion-content"
              initial={collapsed}
              animate={expanded}
              exit={collapsed}
              transition={transition}
              style={{ overflow: 'hidden', ...style }}
              {...props}
            />
          </AccordionPrimitive.Content>
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
  AccordionContent,
  useAccordion,
  useAccordionItem,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionHeaderProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
  type AccordionContextType,
  type AccordionItemContextType,
};
