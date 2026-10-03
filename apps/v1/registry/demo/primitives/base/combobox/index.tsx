import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxPopup,
  ComboboxPortal,
  ComboboxPositioner,
} from '@/registry/primitives/base/combobox';

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

interface BaseComboboxDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

export function BaseComboboxDemo({
  side,
  sideOffset,
  align,
}: BaseComboboxDemoProps) {
  return (
    <Combobox items={FRUITS}>
      <ComboboxInput
        aria-label="Fruit"
        placeholder="Search a fruit"
        className="w-56 border bg-background px-3 py-1.5 text-sm outline-none"
      />
      <ComboboxPortal>
        <ComboboxPositioner
          side={side}
          sideOffset={sideOffset}
          align={align}
          className="z-50"
        >
          <ComboboxPopup className="w-(--anchor-width) border bg-background">
            <ComboboxEmpty className="px-3 py-2 text-sm text-muted-foreground empty:p-0">
              No results.
            </ComboboxEmpty>
            <ComboboxList className="max-h-[min(15rem,var(--available-height))] overflow-y-auto p-1 empty:p-0">
              {(fruit: string) => (
                <ComboboxItem
                  key={fruit}
                  value={fruit}
                  className="flex items-center justify-between gap-4 px-2 py-1 text-sm outline-none data-[highlighted]:bg-accent"
                >
                  {fruit}
                  <ComboboxItemIndicator>✓</ComboboxItemIndicator>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </ComboboxPositioner>
      </ComboboxPortal>
    </Combobox>
  );
}
