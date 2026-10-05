'use client';

import { useTheme } from 'next-themes';
import { FireworksBackground } from '@/registry/components/backgrounds/fireworks';

type FireworksCircleBackgroundDemoProps = {
  population: number;
  fireworkSize: number;
  fireworkSpeed: number;
  particleSize: number;
  particleSpeed: number;
};

export default function FireworksCircleBackgroundDemo({
  population,
  fireworkSize,
  fireworkSpeed,
  particleSize,
  particleSpeed,
}: FireworksCircleBackgroundDemoProps) {
  const { resolvedTheme: theme } = useTheme();

  return (
    <FireworksBackground
      className="absolute inset-0 flex items-center justify-center rounded-xl"
      color={theme === 'dark' ? 'white' : 'black'}
      population={population}
      fireworkSize={fireworkSize}
      fireworkSpeed={fireworkSpeed}
      particleSize={particleSize}
      particleSpeed={particleSpeed}
    />
  );
}
