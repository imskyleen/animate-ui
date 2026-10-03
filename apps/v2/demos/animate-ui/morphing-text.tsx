import { MorphingText } from "@animate-ui/react/primitives/texts/morphing"

const texts = [
  "Morphing Text",
  "Animate your text 🚀",
  "Handles emojis ✨",
  "Built with Motion",
]

export default function MorphingTextDemo() {
  return (
    <MorphingText
      className="max-w-2xl text-center text-4xl font-semibold"
      text={texts}
      loop
    />
  )
}
