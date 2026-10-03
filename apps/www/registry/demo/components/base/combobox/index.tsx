'use client';

import { AnimatePresence } from 'motion/react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/registry/components/base/combobox';

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

interface BaseComboboxDemoProps {
  multiple?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

export function BaseComboboxDemo({
  multiple = false,
  side,
  sideOffset,
  align,
}: BaseComboboxDemoProps) {
  if (multiple) {
    return <BaseComboboxMultipleDemo side={side} sideOffset={sideOffset} />;
  }

  return (
    <Combobox items={FRAMEWORKS}>
      <ComboboxInput
        aria-label="Framework"
        placeholder="Select a framework"
        className="w-64"
      />
      <ComboboxContent side={side} sideOffset={sideOffset} align={align}>
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          {(framework: string) => (
            <ComboboxItem key={framework} value={framework}>
              {framework}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function BaseComboboxMultipleDemo({
  side,
  sideOffset,
}: Pick<BaseComboboxDemoProps, 'side' | 'sideOffset'>) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox items={FRAMEWORKS} multiple defaultValue={['Next.js', 'Astro']}>
      <ComboboxChips ref={anchor} className="w-80">
        <ComboboxValue>
          {(values: string[]) => (
            <>
              <AnimatePresence mode="popLayout" initial={false}>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
              </AnimatePresence>
              <ComboboxChipsInput
                aria-label="Frameworks"
                placeholder={values.length ? '' : 'Add a framework'}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor} side={side} sideOffset={sideOffset}>
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          {(framework: string) => (
            <ComboboxItem key={framework} value={framework}>
              {framework}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
