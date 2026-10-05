import { LiquidButton } from '@/registry/primitives/buttons/liquid';

interface LiquidButtonDemoProps {
  delay?: string;
  fillHeight?: string;
  hoverScale?: number;
  tapScale?: number;
}

export default function LiquidButtonDemo({
  delay,
  fillHeight,
  hoverScale,
  tapScale,
}: LiquidButtonDemoProps) {
  return (
    <LiquidButton
      key={`${delay}-${fillHeight}-${hoverScale}-${tapScale}`}
      delay={`${delay}s`}
      fillHeight={`${fillHeight}px`}
      hoverScale={hoverScale}
      tapScale={tapScale}
      className="text-sm font-medium px-4 py-2 h-10 overflow-hidden [--liquid-button-color:var(--primary)] [--liquid-button-background-color:var(--accent)] text-primary hover:text-primary-foreground"
    >
      Liquid Button
    </LiquidButton>
  );
}
