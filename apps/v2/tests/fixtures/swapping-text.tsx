'use client';

import * as React from 'react';
import {
  SwappingText,
  type SwappingTextDirection,
} from '@animate-ui/react/primitives/texts/swapping';

export default function SwappingTextFixture() {
  const [isPublic, setIsPublic] = React.useState(false);
  const [direction, setDirection] = React.useState<SwappingTextDirection>('up');
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get('direction') === 'down')
      setDirection('down');
  }, []);

  return (
    <div className="flex flex-col items-start gap-6 text-2xl">
      <button type="button" onClick={() => setIsPublic((value) => !value)}>
        <SwappingText
          data-testid="toggle"
          text={isPublic ? 'Public' : 'Private'}
          direction={direction}
        />
      </button>
      <SwappingText
        data-testid="cycle"
        text={['One', 'Two', 'Six']}
        duration={600}
      />
    </div>
  );
}
