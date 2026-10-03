import { Effect } from '@/registry/primitives/effects/effect';

type EffectDemoProps = {
  delay?: number;
  blur?: boolean;
  slide?: boolean;
  fade?: boolean;
  zoom?: boolean;
};

export default function EffectDemo({
  delay = 0,
  blur = false,
  slide = false,
  fade = false,
  zoom = false,
}: EffectDemoProps) {
  return (
    <Effect
      delay={delay}
      blur={blur}
      slide={slide}
      fade={fade}
      zoom={zoom}
      className="px-6 py-4 bg-accent"
    >
      Effect
    </Effect>
  );
}
