import { Fade } from '@/registry/primitives/effects/fade';

type FadeDemoProps = {
  delay?: number;
  initialOpacity?: number;
  opacity?: number;
};

export default function FadeDemo({
  delay = 0,
  initialOpacity = 0,
  opacity = 1,
}: FadeDemoProps) {
  return (
    <Fade
      delay={delay}
      initialOpacity={initialOpacity}
      opacity={opacity}
      className="px-6 py-4 bg-accent"
    >
      Fade
    </Fade>
  );
}
