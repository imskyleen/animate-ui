'use client';

import * as React from 'react';
import { AnimateIcon } from '@animate-ui/react/icons';

import { Bell } from '@/registry/icons/bell';
import { CirclePlus } from '@/registry/icons/circle-plus';
import { Fingerprint } from '@/registry/icons/fingerprint';
import { PanelLeft } from '@/registry/icons/panel-left';
import { RefreshCw } from '@/registry/icons/refresh-cw';

function NoRef({ children }: { children?: React.ReactNode }) {
  return <span className="inline-flex">{children}</span>;
}

export default function IconsFixture() {
  const [play, setPlay] = React.useState(false);
  const [delayed, setDelayed] = React.useState(false);
  const [drawn, setDrawn] = React.useState(false);
  const [panel, setPanel] = React.useState(true);
  const viewRef = React.useRef<HTMLSpanElement>(null);

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="loop-turn">
        <AnimateIcon animate loop loopDelay={300} animation="rotate">
          <RefreshCw size={48} />
        </AnimateIcon>
      </section>
      <section data-testid="loop-no-ref">
        <AnimateIcon asChild animate loop loopDelay={200} animation="rotate">
          <NoRef>
            <RefreshCw size={48} />
          </NoRef>
        </AnimateIcon>
      </section>
      <section data-testid="mounted-animated">
        <PanelLeft animate={panel} initial={false} size={48} />
        <button type="button" onClick={() => setPanel((on) => !on)}>
          Toggle panel
        </button>
      </section>
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
      <AnimateIcon animateOnHover data-testid="group-override">
        <span className="inline-flex p-2">
          <Bell speed={1.5} size={48} />
        </span>
      </AnimateIcon>
      <section data-testid="group-delay" className="flex items-center gap-4">
        <button type="button" onClick={() => setDelayed(true)}>
          Play delayed
        </button>
        <AnimateIcon animate={delayed} delay={400}>
          <span className="inline-flex p-2">
            <Bell speed={1} size={48} />
          </span>
        </AnimateIcon>
      </section>
      <section data-testid="path" className="flex items-center gap-4">
        <button type="button" onClick={() => setDrawn(true)}>
          Draw
        </button>
        <CirclePlus animate={drawn} animation="path" size={48} />
        <Fingerprint size={48} />
      </section>
      <section data-testid="tap-loop">
        <Bell animateOnTap loop size={48} />
      </section>
      <div className="h-[1500px]" />
      <AnimateIcon
        ref={viewRef}
        animateOnView
        data-testid="view-ref"
        className="inline-flex"
      >
        <Bell size={48} />
      </AnimateIcon>
    </div>
  );
}
