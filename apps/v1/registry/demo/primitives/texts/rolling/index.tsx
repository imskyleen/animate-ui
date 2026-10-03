import { RollingText } from '@/registry/primitives/texts/rolling';

interface RollingTextDemoProps {
  delay: number;
}

export const RollingTextDemo = ({ delay }: RollingTextDemoProps) => {
  return (
    <RollingText
      key={delay}
      delay={delay}
      className="text-4xl font-semibold"
      text="Rolling Text"
    />
  );
};
