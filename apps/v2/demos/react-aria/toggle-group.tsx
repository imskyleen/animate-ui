"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import {
  ToggleButtonGroup as ToggleGroupPrimitive,
  ToggleButton as TogglePrimitive,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "@animate-ui/react/primitives/react-aria"

import { toggleVariants } from "@/components/ui/react-aria/toggle"
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { useAnimate, useReducedMotion } from "motion/react"

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
}: Omit<ToggleButtonGroupProps, "children"> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
    children?: React.ReactNode
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      orientation={orientation}
      style={
        { "--gap": `calc(var(--spacing) * ${spacing})` } as React.CSSProperties
      }
      className={cn(
        "rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] group/toggle-group flex w-fit flex-row items-center gap-(--gap) data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: ToggleButtonProps & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
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
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }

export const controls = {
  ToggleGroup: {
    multiple: { value: true },
    variant: {
      value: "outline",
      options: { default: "default", outline: "outline" },
    },
    size: {
      value: "default",
      options: { default: "default", sm: "sm", lg: "lg" },
    },
    spacing: { value: 2, min: 0, max: 4, step: 1 },
    orientation: {
      value: "horizontal",
      options: { horizontal: "horizontal", vertical: "vertical" },
    },
  },
}

// The icons answer their item turning on: bold pops, italic tilts and
// settles, underline draws its line from left to right; turned off, they
// give a little. Nothing moves on mount, nor under reduced motion.
function ToggleIcon({
  icon,
  on,
  motion,
}: {
  icon: IconSvgElement
  on: boolean
  motion: "pop" | "tilt" | "draw"
}) {
  const [scopeRef, animate] = useAnimate<HTMLSpanElement>()
  const reduce = useReducedMotion()
  const wasOnRef = React.useRef(on)

  React.useEffect(() => {
    if (wasOnRef.current === on) return
    wasOnRef.current = on
    if (reduce) return
    if (!on)
      animate(
        scopeRef.current,
        { scale: [1, 0.9, 1] },
        { duration: 0.35, times: [0, 0.4, 1], ease: ["easeOut", [0.34, 1.56, 0.64, 1]] }
      )
    else if (motion === "pop")
      animate(
        scopeRef.current,
        { scale: [1, 1.2, 1] },
        { duration: 0.35, times: [0, 0.4, 1], ease: ["easeOut", [0.34, 1.56, 0.64, 1]] }
      )
    else if (motion === "tilt")
      animate(
        scopeRef.current,
        { rotate: [0, -14, 0] },
        { duration: 0.4, times: [0, 0.35, 1], ease: ["easeOut", [0.34, 1.56, 0.64, 1]] }
      )
    // The underline only: the icon's last stroke, drawn from its start
    // (shown once it has some length, its dash pattern never repeating: a
    // round cap would leave a dot).
    else
      animate(
        "path:last-of-type",
        { pathLength: [0, 1], pathSpacing: 2, opacity: [0, 1] },
        { duration: 0.35, ease: [0, 0, 0.58, 1], opacity: { duration: 0.05 } }
      )
  }, [on, reduce, motion, animate, scopeRef])

  return (
    <span ref={scopeRef} className="inline-flex">
      <HugeiconsIcon icon={icon} strokeWidth={2} />
    </span>
  )
}

export default function ToggleGroupDemo({
  multiple = true,
  variant = "outline",
  size = "default",
  spacing = 2,
  orientation = "horizontal",
}: {
  /** Several items pressed at once. */
  multiple?: boolean
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  /** Gap between the items (0: joined); a string from the test URL. */
  spacing?: number | string
  orientation?: "horizontal" | "vertical"
}) {
  const [value, setValue] = React.useState<string[]>([])

  return (
    <ToggleGroup
      key={String(multiple)}
      variant={variant}
      selectionMode={multiple ? "multiple" : "single"}
      size={size}
      spacing={Number(spacing)}
      orientation={orientation}
      selectedKeys={value}
      onSelectionChange={(keys) => setValue([...keys].map(String))}
    >
      <ToggleGroupItem id="bold" aria-label="Toggle bold">
        <ToggleIcon icon={TextBoldIcon} on={value.includes("bold")} motion="pop" />
      </ToggleGroupItem>
      <ToggleGroupItem id="italic" aria-label="Toggle italic">
        <ToggleIcon icon={TextItalicIcon} on={value.includes("italic")} motion="tilt" />
      </ToggleGroupItem>
      <ToggleGroupItem id="strikethrough" aria-label="Toggle strikethrough">
        <ToggleIcon icon={TextUnderlineIcon} on={value.includes("strikethrough")} motion="draw" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
