'use client';

import * as React from 'react';
import {
  Highlight,
  HighlightItem,
} from '@animate-ui/react/primitives/effects/highlight';

const bg = 'bg-black/10';

export default function AnimateUIHighlightCasesFixture() {
  const [log, setLog] = React.useState<string[]>([]);
  const [wide, setWide] = React.useState(false);
  const [refTag, setRefTag] = React.useState('');
  const childRef = React.useRef<HTMLButtonElement>(null);
  const push = (entry: string) => setLog((l) => [...l, entry]);

  React.useEffect(() => {
    setRefTag(childRef.current?.tagName ?? 'none');
  }, []);

  return (
    <div className="flex flex-col items-start gap-6">
      <div data-testid="disabled-children">
        <Highlight className={bg} defaultValue="a" disabled>
          <button data-value="a">Disabled A</button>
          <button data-value="b">Disabled B</button>
        </Highlight>
      </div>

      <div data-testid="disabled-parent">
        <Highlight mode="parent" className={bg} defaultValue="a" disabled>
          <button data-value="a">Parent disabled A</button>
          <button data-value="b">Parent disabled B</button>
        </Highlight>
      </div>

      <Highlight className={bg} controlledItems>
        <HighlightItem value="click" onClick={() => push('item click')}>
          <button
            onClick={() => push('child click')}
            style={{ color: 'rgb(255, 0, 0)' }}
          >
            Handlers
          </button>
        </HighlightItem>
      </Highlight>

      <Highlight mode="parent" className={bg} controlledItems>
        <HighlightItem value="ref" asChild>
          <button ref={childRef}>Ref</button>
        </HighlightItem>
      </Highlight>

      <div data-testid="resize">
        <Highlight mode="parent" className={bg} defaultValue="grow">
          <button data-value="grow" style={{ width: wide ? 240 : 120 }}>
            Grow
          </button>
        </Highlight>
      </div>
      <button onClick={() => setWide(true)}>Widen</button>

      <output data-testid="log">{log.join(',')}</output>
      <output data-testid="ref">{refTag}</output>
    </div>
  );
}
