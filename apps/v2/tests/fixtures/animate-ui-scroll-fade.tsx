'use client';

import * as React from 'react';
import { ScrollFade } from '@animate-ui/react/primitives/effects/scroll-fade';

const items = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className="h-10 shrink-0 border-b px-2 leading-10">
      Item {i + 1}
    </div>
  ));

function AsChild() {
  const ref = React.useRef<HTMLUListElement>(null);
  const [seen, setSeen] = React.useState('');
  React.useEffect(() => {
    setSeen(ref.current?.tagName ?? 'none');
  }, []);
  return (
    <ScrollFade asChild className="faded">
      <ul
        ref={ref}
        data-testid="as-child"
        data-ref={seen}
        className="h-[200px] w-60 border"
        style={{ paddingTop: 4 }}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <li key={i} className="h-10 leading-10">
            Row {i + 1}
          </li>
        ))}
      </ul>
    </ScrollFade>
  );
}

export default function ScrollFadeFixture() {
  return (
    <div className="flex flex-col gap-6">
      <ScrollFade data-testid="short" className="h-[200px] w-60 border">
        {items(3)}
      </ScrollFade>
      <ScrollFade data-testid="long" className="h-[200px] w-60 border">
        {items(20)}
      </ScrollFade>
      <ScrollFade
        data-testid="horizontal"
        orientation="horizontal"
        className="flex w-[200px] border"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="w-20 shrink-0 border-r px-2 py-4">
            {i + 1}
          </div>
        ))}
      </ScrollFade>
      <AsChild />
    </div>
  );
}
