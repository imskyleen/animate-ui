'use client';

import { AnimateUIProvider } from '@animate-ui/react/provider';
import { Collapsible } from '@animate-ui/react/primitives/radix-ui/collapsible';
import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';

function Shown({ id }: { id: string }) {
  const reduce = useShouldReduceMotion();
  return <output data-testid={id}>{reduce ? 'reduced' : 'full'}</output>;
}

export default function ReducedMotionSettingFixture() {
  return (
    <div className="flex flex-col items-start gap-6">
      <Shown id="user" />
      <AnimateUIProvider reducedMotion="never">
        <Shown id="never" />
        <Collapsible.Root>
          <Collapsible.Trigger>Toggle</Collapsible.Trigger>
          <Collapsible.Content data-testid="never-panel">
            <div style={{ height: 200 }}>Panel</div>
          </Collapsible.Content>
        </Collapsible.Root>
      </AnimateUIProvider>
      <AnimateUIProvider reducedMotion="always">
        <Shown id="always" />
      </AnimateUIProvider>
    </div>
  );
}
