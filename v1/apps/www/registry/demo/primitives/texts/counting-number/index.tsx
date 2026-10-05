import { CountingNumber } from '@/registry/primitives/texts/counting-number';

interface CountingFromNumberDemoProps {
  number: number;
  fromNumber: number;
  padStart: boolean;
  decimalSeparator: string;
  decimalPlaces: number;
  delay: number;
}

export const CountingFromNumberDemo = ({
  number,
  fromNumber,
  padStart,
  decimalSeparator,
  decimalPlaces,
  delay,
}: CountingFromNumberDemoProps) => {
  return (
    <CountingNumber
      key={delay}
      delay={delay}
      number={number}
      fromNumber={fromNumber}
      padStart={padStart}
      decimalSeparator={decimalSeparator}
      decimalPlaces={decimalPlaces}
      className="text-4xl font-semibold"
    />
  );
};
