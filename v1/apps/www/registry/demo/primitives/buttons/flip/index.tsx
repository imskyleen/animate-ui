import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from '@/registry/primitives/buttons/flip';

type FlipButtonDemoProps = {
  from?: 'top' | 'right' | 'bottom' | 'left';
  tapScale?: number;
};

export default function FlipButtonDemo({
  from,
  tapScale,
}: FlipButtonDemoProps) {
  return (
    <FlipButton
      key={`${from}-${tapScale}`}
      from={from}
      tapScale={tapScale}
      className="text-sm font-medium"
    >
      <FlipButtonFront className="px-4 py-2 h-10 bg-primary text-primary-foreground flex items-center justify-center">
        Front
      </FlipButtonFront>
      <FlipButtonBack className="px-4 py-2 h-10 bg-accent text-accent-foreground flex items-center justify-center">
        Back Button
      </FlipButtonBack>
    </FlipButton>
  );
}
