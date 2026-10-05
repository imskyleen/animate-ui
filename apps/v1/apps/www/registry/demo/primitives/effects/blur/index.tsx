import { Blur } from '@/registry/primitives/effects/blur';

type BlurDemoProps = {
  delay?: number;
  initialBlur?: number;
  blur?: number;
};

export default function BlurDemo({
  delay = 0,
  initialBlur = 10,
  blur = 0,
}: BlurDemoProps) {
  return (
    <Blur
      delay={delay}
      initialBlur={initialBlur}
      blur={blur}
      className="px-6 py-4 bg-accent"
    >
      Blur
    </Blur>
  );
}
