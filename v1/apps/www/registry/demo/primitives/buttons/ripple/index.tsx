import {
  RippleButton,
  RippleButtonRipples,
} from '@/registry/primitives/buttons/ripple';

interface RippleButtonDemoProps {
  hoverScale: number;
  tapScale: number;
}

export default function RippleButtonDemo({
  hoverScale,
  tapScale,
}: RippleButtonDemoProps) {
  return (
    <RippleButton
      key={`${hoverScale}-${tapScale}`}
      hoverScale={hoverScale}
      tapScale={tapScale}
      className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 h-10 [--ripple-button-ripple-color:var(--primary-foreground)]"
    >
      Ripple Button
      <RippleButtonRipples />
    </RippleButton>
  );
}
