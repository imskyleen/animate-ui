import { Zoom } from '@/registry/primitives/effects/zoom';

type ZoomDemoProps = {
  delay?: number;
  initialScale?: number;
  scale?: number;
};

export default function ZoomDemo({
  delay = 0,
  initialScale = 0.5,
  scale = 1,
}: ZoomDemoProps) {
  return (
    <Zoom
      delay={delay}
      initialScale={initialScale}
      scale={scale}
      className="px-6 py-4 bg-accent"
    >
      Zoom
    </Zoom>
  );
}
