"use client"

import * as React from "react"
import { cn } from "cn"
import { Accordion as AccordionPrimitive } from "@animate-ui/react/primitives/radix-ui"

import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
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
          "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground rounded-lg py-2.5 text-left text-sm font-medium hover:underline focus-visible:ring-3 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-350 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-aria-expanded/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="text-sm overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-2.5 h-(--radix-accordion-content-height) [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

const ITEMS = [
  {
    value: "what",
    question: "What is Animate UI?",
    answer:
      "Animated drop-in primitives for Radix UI, Base UI and React Aria. Swap the import and your components animate.",
  },
  {
    value: "different",
    question: "How is it different from other libraries?",
    answer:
      "You keep your own components. Animate UI only replaces the primitives underneath, so your styles and structure stay yours.",
  },
  {
    value: "free",
    question: "Is Animate UI free to use?",
    answer: "Yes. Animate UI is open source under the MIT license.",
  },
]

export const controls = {
  Accordion: {
    multiple: { value: false },
    collapsible: { value: true },
  },
}

export default function AccordionDemo({
  multiple = false,
  collapsible = true,
}: {
  /** type="multiple": several items open at once. */
  multiple?: boolean
  /** type="single": the open item can close. */
  collapsible?: boolean
}) {
  const props = multiple
    ? { type: "multiple" as const, defaultValue: ["what"] }
    : { type: "single" as const, collapsible, defaultValue: "what" }

  return (
    <Accordion key={props.type} {...props} className="max-w-md">
      {ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
