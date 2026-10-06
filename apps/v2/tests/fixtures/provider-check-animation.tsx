'use client';

import { AnimateUIProvider } from '@animate-ui/react/provider';
import { Checkbox } from '@animate-ui/react/primitives/radix-ui/checkbox';

function Box({
  label,
  animation,
}: {
  label: string;
  animation?: 'draw' | 'pop';
}) {
  return (
    <Checkbox.Root
      aria-label={label}
      className="grid size-5 place-content-center border"
    >
      <Checkbox.Indicator animation={animation}>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

// `checkAnimation` from the closest provider that sets it, `animation` on the
// indicator first, and a nested provider keeping what it doesn't set.
export default function ProviderCheckAnimationFixture() {
  return (
    <div className="flex flex-col gap-6">
      <Box label="Default" />
      <AnimateUIProvider checkAnimation="pop">
        <Box label="Popped" />
        <Box label="Own prop" animation="draw" />
        <AnimateUIProvider tempo={1}>
          <Box label="Nested pop" />
        </AnimateUIProvider>
      </AnimateUIProvider>
      <AnimateUIProvider tempo={2}>
        <AnimateUIProvider checkAnimation="pop">
          <Box label="Slow pop" />
        </AnimateUIProvider>
      </AnimateUIProvider>
    </div>
  );
}
