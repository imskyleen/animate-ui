import { Button } from '@/registry/primitives/buttons/button';

interface ButtonDemoProps {
  hoverScale: number;
  tapScale: number;
}

export default function ButtonDemo({ hoverScale, tapScale }: ButtonDemoProps) {
  return (
    <Button
      key={`${hoverScale}-${tapScale}`}
      hoverScale={hoverScale}
      tapScale={tapScale}
      className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 h-10"
    >
      Button
    </Button>
  );
}
