'use client';

import { CopyButton } from '@animate-ui/react/primitives/buttons/copy';
import { LiquidButton } from '@animate-ui/react/primitives/buttons/liquid';
import { Click } from '@animate-ui/react/primitives/effects/click';
import { Shine } from '@animate-ui/react/primitives/effects/shine';

export default function MinorCasesFixture() {
  return (
    <div className="flex flex-col items-start gap-4">
      <CopyButton content="hello">Copy</CopyButton>
      <LiquidButton style={{ color: 'rgb(255, 0, 0)' }}>Liquid</LiquidButton>
      <Shine
        data-testid="shine"
        style={{ background: 'rgb(1, 2, 3)', width: 120, height: 40 }}
      >
        Shine
      </Shine>
      <Click />
    </div>
  );
}
