import {
  TypingText,
  TypingTextCursor,
} from '@/registry/primitives/texts/typing';

interface TypingTextDemoProps {
  delay: number;
  holdDelay: number;
  loop: boolean;
  cursor: boolean;
}

export const TypingTextDemo = ({
  delay,
  holdDelay,
  loop,
  cursor,
}: TypingTextDemoProps) => {
  return (
    <TypingText
      key={`${delay}-${holdDelay}-${loop}-${cursor}`}
      delay={delay}
      holdDelay={holdDelay}
      className="text-4xl font-semibold"
      text="Typing Text component made with Motion. Highly customizable and easy to use."
      loop={loop}
    >
      {cursor && <TypingTextCursor className="!h-8 !w-1 rounded-full ml-1" />}
    </TypingText>
  );
};
