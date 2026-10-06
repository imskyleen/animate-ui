"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Checkbox as CheckboxPrimitive,
  composeRenderProps,
  type CheckboxProps,
} from "@animate-ui/react/primitives/react-aria"
import { AnimateUIProvider } from "@animate-ui/react/provider"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Label } from "@/components/ui/label"

function Checkbox({ className, children, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      className={cn(
        "border-input dark:bg-input/30 data-checked:text-primary-foreground aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border transition-colors duration-300 group-has-disabled/field:opacity-50 focus-visible:ring-3 aria-invalid:ring-3 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary data-selected:text-primary-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 data-focus-visible:ring-3 data-invalid:data-selected:border-primary data-invalid:border-destructive dark:data-invalid:border-destructive/50 data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 data-invalid:ring-3 peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 before:absolute before:-inset-px before:rounded-[inherit] before:bg-primary before:opacity-0 before:scale-70 before:transition-[scale,opacity] before:duration-300 motion-reduce:before:scale-100 data-selected:before:opacity-100 data-selected:before:scale-100 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {composeRenderProps(
        children,
        (children, { isSelected, isIndeterminate }) => (
          <>
            <span
              data-slot="checkbox-indicator"
              className="[&>svg]:size-3.5 relative grid place-content-center text-current transition-none"
            >
              {(isSelected || isIndeterminate) && (
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2}
                />
              )}
            </span>
            {children}
          </>
        )
      )}
    </CheckboxPrimitive>
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
        <div className="flex items-center gap-2">
          <Checkbox
            id="terms"
            isSelected={checked === true}
            isIndeterminate={checked === "indeterminate"}
            onChange={setChecked}
          />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox id="updates" />
          <div className="grid gap-1.5">
            <Label htmlFor="updates">Product updates</Label>
            <p className="text-muted-foreground text-sm">
              A short email when a new primitive ships.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="digest" isDisabled />
          <Label htmlFor="digest">Weekly digest (coming soon)</Label>
        </div>
      </div>
    </AnimateUIProvider>
  )
}
