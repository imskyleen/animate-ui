'use client';

import * as React from 'react';
import { Switch as PlainSwitch } from 'radix-ui';
import { Switch as RadixSwitch } from '@animate-ui/react/primitives/radix-ui/switch';
import { Switch as BaseSwitch } from '@animate-ui/react/primitives/base-ui/switch';
import { Switch as AriaSwitch } from '@animate-ui/react/primitives/react-aria';

const track =
  'data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-unchecked:bg-input/80 shrink-0 rounded-full border border-transparent focus-visible:ring-3 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex items-center outline-none';
const ariaTrack = `${track} data-selected:bg-primary not-data-selected:bg-input dark:not-data-selected:bg-input/80`;
const thumb =
  'bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 pointer-events-none block ring-0';
const ariaThumb = `${thumb} dark:not-data-selected:bg-foreground dark:data-selected:bg-primary-foreground group-data-[size=default]/switch:data-selected:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-selected:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:not-data-selected:translate-x-0 group-data-[size=sm]/switch:not-data-selected:translate-x-0`;

const CASES = [
  { size: 'default', checked: false },
  { size: 'default', checked: true },
  { size: 'sm', checked: false },
] as const;

export default function SwitchGeometryFixture() {
  return (
    <div className="flex flex-col gap-6">
      {(['plain', 'radix-ui', 'base-ui', 'react-aria'] as const).map((lib) => (
        <section
          key={lib}
          data-testid={lib}
          className="flex items-center gap-6"
        >
          {CASES.map(({ size, checked }, i) => {
            const common = {
              'data-slot': 'switch',
              'data-size': size,
              'aria-label': `${lib} ${i}`,
            };
            const thumbProps = { 'data-slot': 'switch-thumb' };
            if (lib === 'plain')
              return (
                <PlainSwitch.Root
                  key={i}
                  {...common}
                  className={track}
                  defaultChecked={checked}
                >
                  <PlainSwitch.Thumb {...thumbProps} className={thumb} />
                </PlainSwitch.Root>
              );
            if (lib === 'radix-ui')
              return (
                <RadixSwitch.Root
                  key={i}
                  {...common}
                  className={track}
                  defaultChecked={checked}
                >
                  <RadixSwitch.Thumb {...thumbProps} className={thumb} />
                </RadixSwitch.Root>
              );
            if (lib === 'base-ui')
              return (
                <BaseSwitch.Root
                  key={i}
                  {...common}
                  className={track}
                  defaultChecked={checked}
                >
                  <BaseSwitch.Thumb {...thumbProps} className={thumb} />
                </BaseSwitch.Root>
              );
            return (
              <AriaSwitch
                key={i}
                {...common}
                className={ariaTrack}
                defaultSelected={checked}
              >
                {({ isSelected }) => (
                  <span
                    {...thumbProps}
                    data-selected={isSelected || undefined}
                    className={ariaThumb}
                  />
                )}
              </AriaSwitch>
            );
          })}
        </section>
      ))}
    </div>
  );
}
