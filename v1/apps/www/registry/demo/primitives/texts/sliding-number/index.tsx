import { SlidingNumber } from '@/registry/primitives/texts/sliding-number';

interface SlidingNumberDemoProps {
  number: number;
  fromNumber: boolean;
  padStart: boolean;
  decimalSeparator: string;
  decimalPlaces: number;
  thousandSeparator: string;
  delay: number;
}

export const SlidingNumberDemo = ({
  number,
  fromNumber,
  padStart,
  decimalSeparator,
  decimalPlaces,
  thousandSeparator,
  delay,
}: SlidingNumberDemoProps) => {
  return (
    <SlidingNumber
      key={`${delay}-${fromNumber}`}
      delay={delay}
      number={number}
      fromNumber={fromNumber ? 0 : undefined}
      padStart={padStart}
      decimalSeparator={decimalSeparator}
      decimalPlaces={decimalPlaces}
      thousandSeparator={thousandSeparator}
      className="text-4xl font-semibold"
    />
  );
};
