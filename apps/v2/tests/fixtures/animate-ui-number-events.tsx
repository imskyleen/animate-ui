'use client';

import * as React from 'react';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
  ScrollingNumber,
  ScrollingNumberContainer,
  ScrollingNumberItems,
} from '@animate-ui/react/primitives/texts/scrolling-number';

export default function AnimateUINumberEventsFixture() {
  const [last, setLast] = React.useState<number | null>(null);
  const [completed, setCompleted] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-4">
      <SlidingNumber number={42} fromNumber={0} onNumberChange={setLast} />
      <ScrollingNumberContainer number={300} step={100} itemsSize={40}>
        <ScrollingNumber onCompleted={() => setCompleted(true)}>
          <ScrollingNumberItems />
        </ScrollingNumber>
      </ScrollingNumberContainer>
      <output data-testid="sliding">{String(last)}</output>
      <output data-testid="scrolling">{String(completed)}</output>
    </div>
  );
}
