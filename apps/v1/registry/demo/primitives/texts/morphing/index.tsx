import { MorphingText } from '@/registry/primitives/texts/morphing';

const texts = [
  'MorphingText Primitive',
  'Animate your text 🚀',
  'Handles emojis 🚀✨',
  'Built with Motion ✨',
];

interface MorphingTextDemoProps {
  loop: boolean;
  holdDelay: number;
}

export const MorphingTextDemo = ({
  loop,
  holdDelay,
}: MorphingTextDemoProps) => {
  return (
    <MorphingText
      key={`${loop}-${holdDelay}`}
      className="text-4xl font-semibold max-w-2xl"
      text={texts}
      loop={loop}
      holdDelay={holdDelay}
    />
  );
};
