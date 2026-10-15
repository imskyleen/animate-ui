'use client';

import { AnimateUIProvider } from '@animate-ui/react/provider';
import { useTempoTransition } from '@animate-ui/react/utils/motion';

function Paced({ id }: { id: string }) {
  const transition = useTempoTransition({
    type: 'spring',
    visualDuration: 0.4,
    bounce: 0.3,
  });
  return <pre data-testid={id}>{JSON.stringify(transition)}</pre>;
}

export default function ProviderTempoVisualDurationFixture() {
  return (
    <>
      <Paced id="default" />
      <AnimateUIProvider tempo={2}>
        <Paced id="slow" />
      </AnimateUIProvider>
    </>
  );
}
