'use client';

import * as React from 'react';
import { AvatarGroup } from '@animate-ui/react/primitives/avatar-group';

import { FireworksBackground } from '@/registry/backgrounds/fireworks';
import { GravityStarsBackground } from '@/registry/backgrounds/gravity-stars';
import { HoleBackground } from '@/registry/backgrounds/hole';

const box = 'relative h-40 w-60';

export default function EdgeCasesFixture() {
  const starsRef = React.useRef<HTMLDivElement>(null);
  const [starsTag, setStarsTag] = React.useState('');

  React.useEffect(() => {
    setStarsTag(starsRef.current?.tagName ?? 'none');
  }, []);

  return (
    <div className="flex flex-col items-start gap-4">
      <AvatarGroup data-testid="avatar-group">
        <span>A</span>
      </AvatarGroup>
      <div className={box} data-testid="hole-1">
        <HoleBackground numberOfDiscs={1} className="absolute inset-0" />
      </div>
      <div className={box} data-testid="hole-0">
        <HoleBackground numberOfDiscs={0} className="absolute inset-0" />
      </div>
      <div className={box}>
        <GravityStarsBackground
          ref={starsRef}
          data-testid="gravity-stars"
          className="absolute inset-0"
        />
      </div>
      <output data-testid="stars-ref">{starsTag}</output>
      <div className={box} data-testid="fireworks">
        <FireworksBackground population={0} className="absolute inset-0" />
      </div>
    </div>
  );
}
