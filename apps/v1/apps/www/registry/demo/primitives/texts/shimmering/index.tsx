import { ShimmeringText } from '@/registry/primitives/texts/shimmering';

interface ShimmeringTextDemoProps {
  wave: boolean;
  duration: number;
}

export const ShimmeringTextDemo = ({
  wave,
  duration,
}: ShimmeringTextDemoProps) => {
  return (
    <ShimmeringText
      key={`${wave}-${duration}`}
      className="text-4xl font-semibold"
      wave={wave}
      duration={duration}
      text="Shimmering Text"
    />
  );
};
