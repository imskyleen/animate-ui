"use client"

import * as React from "react"
import { cn } from "cn"
import { Checkbox as CheckboxPrimitive } from "@animate-ui/react/primitives/radix-ui"
import { AnimateUIProvider } from "@animate-ui/react/provider"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Label } from "@/components/ui/label"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "border-input dark:bg-input/30 data-checked:text-primary-foreground aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border transition-colors duration-300 group-has-disabled/field:opacity-50 focus-visible:ring-3 aria-invalid:ring-3 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 before:absolute before:-inset-px before:rounded-[inherit] before:bg-primary before:opacity-0 before:scale-70 before:transition-[scale,opacity] before:duration-300 motion-reduce:before:scale-100 data-checked:before:opacity-100 data-checked:before:scale-100 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="[&>svg]:size-3.5 relative grid place-content-center text-current transition-none"
      >
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

export const controls = {
  Checkbox: {
    checked: {
      value: true,
      options: { true: true, false: false, indeterminate: "indeterminate" },
    },
  },
  AnimateUIProvider: {
    checkAnimation: { value: "draw", options: { draw: "draw", pop: "pop" } },
  },
}

export default function CheckboxDemo({
  checked: checkedProp = true,
  checkAnimation = "draw",
}: {
  checked?: boolean | "indeterminate"
  /** How the checks show and hide. */
  checkAnimation?: "draw" | "pop"
}) {
  const [checked, setChecked] = React.useState(checkedProp)
  const [prev, setPrev] = React.useState(checkedProp)
  if (checkedProp !== prev) {
    setPrev(checkedProp)
    setChecked(checkedProp)
  }

  return (
    <AnimateUIProvider checkAnimation={checkAnimation}>
      <div className="flex flex-col gap-5">
        <Label>
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          Accept terms and conditions
        </Label>
        <Label className="items-start">
          <Checkbox />
          <div className="grid gap-1.5 font-normal">
            <span className="font-medium">Product updates</span>
            <span className="text-muted-foreground">
              A short email when a new primitive ships.
            </span>
          </div>
        </Label>
        <Label>
          <Checkbox disabled />
          Weekly digest (coming soon)
        </Label>
      </div>
    </AnimateUIProvider>
  )
}
