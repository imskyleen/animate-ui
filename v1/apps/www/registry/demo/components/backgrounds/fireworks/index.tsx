'use client';

import { useTheme } from 'next-themes';
import { FireworksBackground } from '@/registry/components/backgrounds/fireworks';

type FireworksBackgroundDemoProps = {
  population: number;
};

export default function FireworksBackgroundDemo({
  population,
}: FireworksBackgroundDemoProps) {
  const { resolvedTheme: theme } = useTheme();

  return (
    <FireworksBackground
      className="absolute inset-0 flex items-center justify-center rounded-xl"
      color={theme === 'dark' ? 'white' : 'black'}
      population={population}
    />
  );
}
