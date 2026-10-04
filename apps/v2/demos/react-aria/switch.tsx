"use client"

import { cn } from "cn"
import {
  composeRenderProps,
  Switch as SwitchPrimitive,
  type SwitchProps as SwitchPrimitiveProps,
} from "@animate-ui/react/primitives/react-aria"
import { Label } from "@/components/ui/label"

function Switch({
  className,
  size = "default",
  children,
  ...props
}: SwitchPrimitiveProps & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive
      data-slot="switch"
      data-size={size}
      className={cn(
        "data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 rounded-full border border-transparent focus-visible:ring-3 aria-invalid:ring-3 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:border-transparent data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-selected:bg-primary not-data-selected:bg-input data-focus-visible:border-ring data-focus-visible:ring-ring/50 dark:not-data-selected:bg-input/80 data-focus-visible:ring-3 data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 data-invalid:border-destructive dark:data-invalid:border-destructive/50 data-invalid:ring-3 peer group/switch relative inline-flex items-center outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {composeRenderProps(children, (children, { isSelected }) => (
        <>
          <span
            data-slot="switch-thumb"
            data-selected={isSelected || undefined}
            className="bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:not-data-selected:bg-foreground dark:data-selected:bg-primary-foreground group-data-[size=default]/switch:data-selected:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-selected:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:not-data-selected:translate-x-0 group-data-[size=sm]/switch:not-data-selected:translate-x-0 pointer-events-none block ring-0"
          />
          {children}
        </>
      ))}
    </SwitchPrimitive>
  )
}

export { Switch }

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Switch id="airplane" />
        <Label htmlFor="airplane">Airplane mode</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="wifi" defaultSelected />
        <Label htmlFor="wifi">Wi-Fi</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="low-power" size="sm" />
        <Label htmlFor="low-power">Low power mode</Label>
      </div>
    </div>
  )
}
