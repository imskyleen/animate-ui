'use client';

import * as React from 'react';

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@/registry/primitives/headless/combobox';

const FRUITS = [
  'Apple',
  'Banana',
  'Blueberry',
  'Cherry',
  'Grapes',
  'Lemon',
  'Mango',
  'Orange',
  'Pineapple',
  'Strawberry',
];

interface HeadlessComboboxDemoProps {
  anchor?: 'top start' | 'top end' | 'bottom start' | 'bottom end';
  gap?: number;
}

export function HeadlessComboboxDemo({
  anchor = 'bottom start',
  gap = 4,
}: HeadlessComboboxDemoProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  const filtered =
    query === ''
      ? FRUITS
      : FRUITS.filter((fruit) =>
          fruit.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox
      value={selected}
      onChange={setSelected}
      onClose={() => setQuery('')}
    >
      <ComboboxInput
        aria-label="Fruit"
        placeholder="Search a fruit"
        className="w-56 border bg-background px-3 py-1.5 text-sm outline-none"
        displayValue={(fruit: string | null) => fruit ?? ''}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ComboboxOptions
        anchor={{ to: anchor, gap }}
        className="z-50 w-(--input-width) border bg-background p-1 data-[anchor=bottom_end]:origin-top-right data-[anchor=bottom_start]:origin-top-left data-[anchor=top_end]:origin-bottom-right data-[anchor=top_start]:origin-bottom-left"
      >
        {filtered.length === 0 ? (
          <div className="px-2 py-1 text-sm text-muted-foreground">
            No results.
          </div>
        ) : (
          filtered.map((fruit) => (
            <ComboboxOption
              key={fruit}
              value={fruit}
              className="group flex items-center justify-between gap-4 px-2 py-1 text-sm data-focus:bg-accent"
            >
              {fruit}
              <span className="invisible group-data-selected:visible">✓</span>
            </ComboboxOption>
          ))
        )}
      </ComboboxOptions>
    </Combobox>
  );
}
