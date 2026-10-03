import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/registry/primitives/base/select';

const FRUITS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Grapes', value: 'grapes' },
  { label: 'Pineapple', value: 'pineapple' },
];

const CITRUS = [
  { label: 'Lemon', value: 'lemon' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grapefruit', value: 'grapefruit' },
];

interface BaseSelectDemoProps {
  alignItemWithTrigger?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <SelectItem
      value={value}
      className="flex items-center justify-between gap-4 px-2 py-1 text-sm outline-none data-[highlighted]:bg-accent"
    >
      <SelectItemText>{label}</SelectItemText>
      <SelectItemIndicator>✓</SelectItemIndicator>
    </SelectItem>
  );
}

export function BaseSelectDemo({
  alignItemWithTrigger,
  side,
  sideOffset,
  align,
}: BaseSelectDemoProps) {
  return (
    <Select items={[...FRUITS, ...CITRUS]}>
      <SelectTrigger
        aria-label="Fruit"
        className="flex w-44 items-center justify-between border px-3 py-1.5 text-sm"
      >
        <SelectValue placeholder="Select a fruit" />
        <SelectIcon>▾</SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectPositioner
          alignItemWithTrigger={alignItemWithTrigger}
          side={side}
          sideOffset={sideOffset}
          align={align}
          className="z-50"
        >
          <SelectPopup className="min-w-(--anchor-width) border bg-background">
            <SelectList className="max-h-(--available-height) overflow-y-auto p-1">
              <SelectGroup>
                <SelectGroupLabel className="px-2 py-1 text-xs text-muted-foreground">
                  Fruits
                </SelectGroupLabel>
                {FRUITS.map((fruit) => (
                  <Item key={fruit.value} {...fruit} />
                ))}
              </SelectGroup>
              <SelectSeparator className="my-1 h-px bg-border" />
              <SelectGroup>
                <SelectGroupLabel className="px-2 py-1 text-xs text-muted-foreground">
                  Citrus
                </SelectGroupLabel>
                {CITRUS.map((fruit) => (
                  <Item key={fruit.value} {...fruit} />
                ))}
              </SelectGroup>
            </SelectList>
          </SelectPopup>
        </SelectPositioner>
      </SelectPortal>
    </Select>
  );
}
