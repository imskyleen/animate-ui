'use client';

import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '@animate-ui/react/primitives/avatar-group';
import { AnimateUIProvider } from '@animate-ui/react/provider';

function Group({ label }: { label: string }) {
  return (
    <AvatarGroup className="h-12 -space-x-3">
      {['A', 'B'].map((initial) => (
        <div
          key={initial}
          role="img"
          aria-label={`${label} ${initial}`}
          className="flex size-12 items-center justify-center rounded-full bg-sky-500 text-white"
        >
          {initial}
          <AvatarGroupTooltip className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background">
            {label} {initial}
          </AvatarGroupTooltip>
        </div>
      ))}
    </AvatarGroup>
  );
}

export default function ProviderAvatarGroupTempoFixture() {
  return (
    <div className="flex gap-40 p-40">
      <Group label="Default" />
      <AnimateUIProvider tempo={2}>
        <Group label="Slow" />
      </AnimateUIProvider>
    </div>
  );
}
