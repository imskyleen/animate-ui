import {
  RippleButton,
  RippleButtonRipples,
} from "@animate-ui/react/primitives/buttons/ripple"

export default function RippleButtonDemo() {
  return (
    <RippleButton className="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium [--ripple-button-ripple-color:var(--primary-foreground)]">
      Ripple Button
      <RippleButtonRipples />
    </RippleButton>
  )
}
