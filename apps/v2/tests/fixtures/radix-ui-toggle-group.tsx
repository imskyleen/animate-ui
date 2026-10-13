'use client';

import * as React from 'react';
import { ToggleGroup } from '@animate-ui/react/primitives/radix-ui/toggle-group';
import * as ToggleGroupStar from '@animate-ui/react/primitives/radix-ui/toggle-group';

import ToggleGroupDemo from '@/demos/radix-ui/toggle-group';

export default function RadixToggleGroupFixture() {
  const [value, setValue] = React.useState('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value || 'none'}</p>
        <button type="button" onClick={() => setValue('a')}>
          Select a
        </button>
        <ToggleGroup.Root
          type="single"
          aria-label="Controlled"
          value={value}
          onValueChange={setValue}
        >
          <ToggleGroup.Item value="a">Controlled a</ToggleGroup.Item>
          <ToggleGroup.Item value="b">Controlled b</ToggleGroup.Item>
        </ToggleGroup.Root>
      </section>

      <section data-testid="star">
        <ToggleGroupStar.Root
          type="multiple"
          aria-label="Star"
          defaultValue={['x']}
        >
          <ToggleGroupStar.Item value="x">Star x</ToggleGroupStar.Item>
          <ToggleGroupStar.Item value="y">Star y</ToggleGroupStar.Item>
        </ToggleGroupStar.Root>
      </section>

      <section data-testid="demo-single">
        <ToggleGroupDemo multiple={false} />
      </section>
    </div>
  );
}
