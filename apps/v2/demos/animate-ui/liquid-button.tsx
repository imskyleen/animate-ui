import { LiquidButton } from "@animate-ui/react/primitives/buttons/liquid"

export default function LiquidButtonDemo() {
  return (
    <LiquidButton className="text-primary hover:text-primary-foreground h-10 overflow-hidden rounded-lg px-4 text-sm font-medium [--liquid-button-background-color:var(--muted)] [--liquid-button-color:var(--primary)]">
      Liquid Button
    </LiquidButton>
  )
}
