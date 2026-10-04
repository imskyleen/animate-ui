'use client';

import * as React from 'react';

import { Bell } from '@/registry/icons/bell';

// The icon core's triggers, on the Bell icon: its group rotates through
// [0, 20, -10, 10, -5, 3, 0]° in 0.9s and its clapper slides through
// [0, -6, 5, -5, 4, -3, 2, 0]px in 1.1s.
export default function IconsFixture() {
  const [play, setPlay] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="hover">
        <Bell animateOnHover size={48} />
      </section>
      <section data-testid="tap">
        <Bell animateOnTap size={48} />
      </section>
      <section data-testid="tap-complete">
        <Bell animateOnTap completeOnStop size={48} />
      </section>
      <section data-testid="speed" className="flex items-center gap-4">
        <button type="button" onClick={() => setPlay(true)}>
          Play
        </button>
        <Bell data-speed="1" animate={play} size={48} />
        <Bell data-speed="2" animate={play} speed={2} size={48} />
      </section>
    </div>
  );
}
