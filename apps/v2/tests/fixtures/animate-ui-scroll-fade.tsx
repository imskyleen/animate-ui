'use client';

import { ScrollFade } from '@animate-ui/react/primitives/effects/scroll-fade';

const items = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className="h-10 shrink-0 border-b px-2 leading-10">
      Item {i + 1}
    </div>
  ));

// Each container is 200px with a 40px fade.
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
    </div>
  );
}
