'use client';

import * as React from 'react';
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from '@/registry/buttons/flip';
import {
  RippleButton,
  RippleButtonRipples,
} from '@animate-ui/react/primitives/buttons/ripple';
import { Click } from '@animate-ui/react/primitives/effects/click';
import {
  ScrollingNumber,
  ScrollingNumberContainer,
  ScrollingNumberItems,
} from '@animate-ui/react/primitives/texts/scrolling-number';

export default function MinorCasesUnmountFixture() {
  const [shown, setShown] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col items-start gap-4">
      {mounted && (
        <ScrollingNumberContainer
          number={3}
          step={0}
          data-testid="scrolling"
          className="h-10 w-10"
        >
          <ScrollingNumber>
            <ScrollingNumberItems />
          </ScrollingNumber>
        </ScrollingNumberContainer>
      )}
      <FlipButton>
        <FlipButtonFront>Front</FlipButtonFront>
        <FlipButtonBack>Back</FlipButtonBack>
      </FlipButton>
      {shown && (
        <>
          <RippleButton>
            Ripple
            <RippleButtonRipples />
          </RippleButton>
          <Click />
        </>
      )}
      <button onClick={() => setShown(false)}>Unmount</button>
    </div>
  );
}
