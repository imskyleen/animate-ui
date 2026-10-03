'use client';

import * as React from 'react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Accordion as AccordionPrimitive } from '@animate-ui/react/primitives/radix-ui/accordion';
import { cn } from 'cn';

// shadcn/ui's Accordion after `animate-ui animate accordion`: the primitive
// import is Animate UI's, and the CSS accordion keyframes are gone.

function Accordion(
  props: React.ComponentProps<typeof AccordionPrimitive.Root>,
) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

const ITEMS = [
  {
    value: 'what',
    question: 'What is Animate UI?',
    answer:
      'Animated drop-in primitives for Radix UI, Base UI and React Aria. Swap the import and your components animate.',
  },
  {
    value: 'different',
    question: 'How is it different from other libraries?',
    answer:
      'You keep your own components. Animate UI only replaces the primitives underneath, so your styles and structure stay yours.',
  },
  {
    value: 'free',
    question: 'Is Animate UI free to use?',
    answer: 'Yes. Animate UI is open source under the MIT license.',
  },
];

export default function AccordionDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="what"
      className="w-full max-w-md"
    >
      {ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
