'use client';

import { BubbleBackground } from '@/registry/backgrounds/bubble';
import { FireworksBackground } from '@/registry/backgrounds/fireworks';
import { GradientBackground } from '@/registry/backgrounds/gradient';
import { GravityStarsBackground } from '@/registry/backgrounds/gravity-stars';
import { HexagonBackground } from '@/registry/backgrounds/hexagon';
import { HoleBackground } from '@/registry/backgrounds/hole';
import { StarsBackground } from '@/registry/backgrounds/stars';

const BACKGROUNDS = {
  bubble: <BubbleBackground interactive className="absolute inset-0" />,
  fireworks: (
    <FireworksBackground className="absolute inset-0" color="#737373" />
  ),
  gradient: <GradientBackground className="absolute inset-0" />,
  'gravity-stars': <GravityStarsBackground className="absolute inset-0" />,
  hexagon: <HexagonBackground className="absolute inset-0" />,
  hole: <HoleBackground className="absolute inset-0" />,
  stars: <StarsBackground className="absolute inset-0" />,
};

export default function BackgroundsFixture() {
  return (
    <div>
      {Object.entries(BACKGROUNDS).map(([name, background]) => (
        <section
          key={name}
          data-testid={name}
          className="relative mb-[150vh] h-[400px] w-[640px] overflow-hidden"
        >
          {background}
        </section>
      ))}
    </div>
  );
}
