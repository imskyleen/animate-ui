'use client';

import { BubbleBackground } from '@/registry/backgrounds/bubble';
import { FireworksBackground } from '@/registry/backgrounds/fireworks';
import { GlyphBackground } from '@/registry/backgrounds/glyph';
import { GradientBackground } from '@/registry/backgrounds/gradient';
import { GravityStarsBackground } from '@/registry/backgrounds/gravity-stars';
import { HexagonBackground } from '@/registry/backgrounds/hexagon';
import { HoleBackground } from '@/registry/backgrounds/hole';
import { StarsBackground } from '@/registry/backgrounds/stars';
import { TopographyBackground } from '@/registry/backgrounds/topography';
import * as React from 'react';

function Child({ name }: { name: string }) {
  return <button data-testid={`${name}-child`}>Click</button>;
}

function Toggled({ render }: { render: (on: boolean) => React.ReactNode }) {
  const [on, setOn] = React.useState(false);
  return (
    <>
      {render(on)}
      <button
        data-testid="toggle"
        className="absolute right-0 bottom-0 z-50"
        onClick={() => setOn((value) => !value)}
      >
        Toggle
      </button>
    </>
  );
}

const BACKGROUNDS = {
  bubble: <BubbleBackground interactive className="absolute inset-0" />,
  fireworks: (
    <FireworksBackground className="absolute inset-0" color="#737373" />
  ),
  glyph: (
    <GlyphBackground className="absolute inset-0 bg-[#121212] text-white" />
  ),
  'glyph-colors': (
    <GlyphBackground
      className="absolute inset-0 bg-[#121212]"
      glowColor="#ff0000"
      shapeColor="#00ff00"
    />
  ),
  gradient: <GradientBackground className="absolute inset-0" />,
  'gravity-stars': <GravityStarsBackground className="absolute inset-0" />,
  hexagon: <HexagonBackground className="absolute inset-0" />,
  hole: <HoleBackground className="absolute inset-0" />,
  stars: <StarsBackground className="absolute inset-0" />,
  'bubble-children': (
    <BubbleBackground className="absolute inset-0">
      <Child name="bubble" />
    </BubbleBackground>
  ),
  'gravity-stars-children': (
    <GravityStarsBackground className="absolute inset-0">
      <Child name="gravity-stars" />
    </GravityStarsBackground>
  ),
  'hexagon-children': (
    <HexagonBackground className="absolute inset-0">
      <Child name="hexagon" />
    </HexagonBackground>
  ),
  'hole-children': (
    <HoleBackground className="absolute inset-0">
      <Child name="hole" />
    </HoleBackground>
  ),
  'hexagon-tight': (
    <div className="absolute inset-0 text-[8px] leading-none">
      <HexagonBackground className="absolute inset-0" />
    </div>
  ),
  'stars-color': (
    <Toggled
      render={(on) => (
        <StarsBackground
          className="absolute inset-0"
          starColor={on ? '#ff0000' : '#fff'}
        />
      )}
    />
  ),
  'fireworks-color': (
    <Toggled
      render={(on) => (
        <FireworksBackground
          className="absolute inset-0"
          color={on ? '#ff0000' : '#0000ff'}
        />
      )}
    />
  ),
  topography: <TopographyBackground className="absolute inset-0" />,
  'topography-red': (
    <TopographyBackground className="absolute inset-0" lineColor="#ff0000" />
  ),
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
