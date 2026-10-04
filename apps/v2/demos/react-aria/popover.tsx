"use client"

import * as React from "react"
import { cn } from "cn"
import {
  DialogTrigger,
  Heading,
  Popover as PopoverPrimitive,
  type DialogTriggerProps,
  type PopoverProps as PopoverPrimitiveProps,
} from "@animate-ui/react/primitives/react-aria"
import { Button } from "@animate-ui/react/primitives/react-aria"
import { buttonVariants } from "@/components/ui/button"
import { Link01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

function PopoverTrigger({ children, ...props }: DialogTriggerProps) {
  return (
    <DialogTrigger data-slot="popover-trigger" {...props}>
      {children}
    </DialogTrigger>
  )
}

function Popover({
  className,
  placement = "bottom",
  offset = 4,
  crossOffset = 0,
  ...props
}: Omit<PopoverPrimitiveProps, "className"> & {
  className?: string
}) {
  return (
    <PopoverPrimitive
      data-slot="popover-content"
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cn(
        "bg-popover text-popover-foreground ring-foreground/10 flex flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 z-50 w-72 origin-(--trigger-anchor-point) outline-hidden",
        className
      )}
      {...props}
    />
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof Heading>) {
  return (
    <Heading
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}

export default function PopoverDemo() {
  return (
    <PopoverTrigger>
      <Button className={buttonVariants({ variant: "outline" })}>Share</Button>
      <Popover className="w-80">
        <PopoverHeader>
          <PopoverTitle>Share this document</PopoverTitle>
          <PopoverDescription>
            Anyone with the link can view the Q3 roadmap.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex items-center gap-2">
          <div className="bg-muted text-muted-foreground flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 text-sm">
            <HugeiconsIcon icon={Link01Icon} strokeWidth={2} className="size-4 shrink-0" />
            <span className="truncate">animate-ui.com/d/q3-roadmap</span>
          </div>
          <Button className={buttonVariants({ size: "sm" })}>Copy link</Button>
        </div>
      </Popover>
    </PopoverTrigger>
  )
}
