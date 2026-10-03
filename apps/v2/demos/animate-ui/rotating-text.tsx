import {
  RotatingText,
  RotatingTextContainer,
} from "@animate-ui/react/primitives/texts/rotating"

export default function RotatingTextDemo() {
  return (
    <RotatingTextContainer
      className="text-4xl font-semibold"
      text={["Rotating", "Text", "Demo"]}
    >
      <RotatingText />
    </RotatingTextContainer>
  )
}
