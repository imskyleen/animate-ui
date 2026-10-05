"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { ToggleGroup as ToggleGroupPrimitive } from "@animate-ui/react/primitives/radix-ui"

import { toggleVariants } from "@/components/ui/toggle"
import { TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }

export const controls = {
  ToggleGroup: {
    multiple: { value: false },
    variant: {
      value: "outline",
      options: { default: "default", outline: "outline" },
    },
    size: {
      value: "default",
      options: { default: "default", sm: "sm", lg: "lg" },
    },
  },
}

export default function ToggleGroupDemo({
  multiple = false,
  variant = "outline",
  size = "default",
}: {
  /** Several items pressed at once (Radix's type="multiple"). */
  multiple?: boolean
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}) {
  const props = multiple
    ? { type: "multiple" as const, defaultValue: ["left"] }
    : { type: "single" as const, defaultValue: "left" }

  return (
    <ToggleGroup
      key={String(multiple)}
      {...props}
      variant={variant}
      size={size}
      spacing={0}
      aria-label="Text alignment"
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <HugeiconsIcon icon={TextAlignCenterIcon} strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <HugeiconsIcon icon={TextAlignRightIcon} strokeWidth={2} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
