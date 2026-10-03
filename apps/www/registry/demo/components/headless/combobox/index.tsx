'use client';

import * as React from 'react';

import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@/registry/components/headless/combobox';

const FRAMEWORKS = [
  'Next.js',
  'SvelteKit',
  'Nuxt.js',
  'Remix',
  'Astro',
  'Gatsby',
  'SolidStart',
  'Qwik City',
];

interface HeadlessComboboxDemoProps {
  anchor?: 'top start' | 'top end' | 'bottom start' | 'bottom end';
  gap?: number;
}

export function HeadlessComboboxDemo({
  anchor = 'bottom start',
  gap = 6,
}: HeadlessComboboxDemoProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  const filtered =
    query === ''
      ? FRAMEWORKS
      : FRAMEWORKS.filter((framework) =>
          framework.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox
      value={selected}
      onChange={setSelected}
      onClose={() => setQuery('')}
    >
      <ComboboxInput
        aria-label="Framework"
        placeholder="Select a framework"
        className="w-64"
        displayValue={(framework: string | null) => framework ?? ''}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ComboboxOptions anchor={{ to: anchor, gap }}>
        {filtered.length === 0 ? (
          <ComboboxEmpty>No results.</ComboboxEmpty>
        ) : (
          filtered.map((framework) => (
            <ComboboxOption key={framework} value={framework}>
              {framework}
            </ComboboxOption>
          ))
        )}
      </ComboboxOptions>
    </Combobox>
  );
}
