"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@animate-ui/react/primitives/base-ui/checkbox"
import { AnimateUIProvider } from "@animate-ui/react/provider"
import { cn } from "cn"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/base-ui/field"
import { Label } from "@/components/ui/base-ui/label"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "border-input dark:bg-input/30 data-checked:text-primary-foreground aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-[4px] border transition-colors duration-300 group-has-disabled/field:opacity-50 focus-visible:ring-3 aria-invalid:ring-3 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 before:absolute before:-inset-px before:rounded-[inherit] before:bg-primary before:opacity-0 before:scale-70 before:transition-[scale,opacity] before:duration-300 motion-reduce:before:scale-100 data-checked:before:opacity-100 data-checked:before:scale-100 disabled:cursor-not-allowed disabled:opacity-50",
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
      <FieldGroup className="max-w-sm">
        <Field orientation="horizontal">
          <Checkbox id="terms-checkbox" name="terms-checkbox" />
          <Label htmlFor="terms-checkbox">Accept terms and conditions</Label>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="terms-checkbox-2"
            name="terms-checkbox-2"
            checked={checked === true}
            indeterminate={checked === "indeterminate"}
            onCheckedChange={(next) => setChecked(next)}
          />
          <FieldContent>
            <FieldLabel htmlFor="terms-checkbox-2">
              Accept terms and conditions
            </FieldLabel>
            <FieldDescription>
              By clicking this checkbox, you agree to the terms.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation="horizontal" data-disabled>
          <Checkbox id="toggle-checkbox" name="toggle-checkbox" disabled />
          <FieldLabel htmlFor="toggle-checkbox">Enable notifications</FieldLabel>
        </Field>
        <FieldLabel>
          <Field orientation="horizontal">
            <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
            <FieldContent>
              <FieldTitle>Enable notifications</FieldTitle>
              <FieldDescription>
                You can enable or disable notifications at any time.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      </FieldGroup>
    </AnimateUIProvider>
  )
}
