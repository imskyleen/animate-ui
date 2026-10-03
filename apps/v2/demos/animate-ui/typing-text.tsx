import {
  TypingText,
  TypingTextCursor,
} from "@animate-ui/react/primitives/texts/typing"

export default function TypingTextDemo() {
  return (
    <TypingText
      className="text-4xl font-semibold"
      text={["Typing Text", "Made with Motion", "Easy to customize"]}
      loop
    >
      <TypingTextCursor className="ml-1 h-8! w-1! rounded-full" />
    </TypingText>
  )
}
