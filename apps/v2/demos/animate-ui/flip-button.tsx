import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@animate-ui/react/primitives/buttons/flip"

export default function FlipButtonDemo() {
  return (
    <FlipButton className="text-sm font-medium">
      <FlipButtonFront className="bg-primary text-primary-foreground h-10 rounded-lg px-4">
        Front
      </FlipButtonFront>
      <FlipButtonBack className="bg-muted text-foreground h-10 rounded-lg px-4">
        Back Button
      </FlipButtonBack>
    </FlipButton>
  )
}
